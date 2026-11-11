import express from 'express';
import db from '../db.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';
import { parseEventDate, isDatePassed } from '../utils/dateUtils.js';

const router = express.Router();

export const ALLOWED_STATUSES = ['Gələcəkdə', 'Davam edir', 'Bitib'];
export const ALLOWED_CATEGORIES = [
  'Konfranslar',
  'Seminarlar',
  'Festivallar',
  'İdman',
  'İncəsənət',
  'Texnologiya',
  'Digər'
];

router.get('/', (req, res) => {
  const sql = `
    SELECT 
      e.*,
      COUNT(r.id) AS registered_count
    FROM events e
    LEFT JOIN registrations r ON e.id = r.event_id
    GROUP BY e.id
    ORDER BY e.date ASC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Tədbirlər yüklənərkən xəta baş verdi.' });
    }
    const sortedRows = [...(rows || [])].sort((a, b) => {
      const timeA = parseEventDate(a.date) || 0;
      const timeB = parseEventDate(b.date) || 0;
      return timeA - timeB;
    });
    res.json(sortedRows);
  });
});

router.get('/my-registrations', authenticate, (req, res) => {
  const sql = `
    SELECT 
      e.*,
      r.registered_at,
      (SELECT COUNT(*) FROM registrations WHERE event_id = e.id) AS registered_count
    FROM registrations r
    JOIN events e ON r.event_id = e.id
    WHERE r.user_id = ?
    ORDER BY r.registered_at DESC
  `;

  db.all(sql, [req.user.id], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Qeydiyyatlar yüklənərkən xəta baş verdi.' });
    }
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  const sql = `
    SELECT 
      e.*,
      COUNT(r.id) AS registered_count
    FROM events e
    LEFT JOIN registrations r ON e.id = r.event_id
    WHERE e.id = ?
    GROUP BY e.id
  `;

  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Baza xətası baş verdi.' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Tədbir tapılmadı.' });
    }
    res.json(row);
  });
});

router.post('/:id/register', authenticate, (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;

  const eventSql = `
    SELECT 
      e.*,
      COUNT(r.id) AS current_registrations
    FROM events e
    LEFT JOIN registrations r ON e.id = r.event_id
    WHERE e.id = ?
    GROUP BY e.id
  `;

  db.get(eventSql, [eventId], (err, event) => {
    if (err || !event) {
      return res.status(404).json({ message: 'Tədbir tapılmadı.' });
    }

    const statusNormalized = event.status ? event.status.trim().toLowerCase() : '';
    if (statusNormalized === 'bitib') {
      return res.status(400).json({ message: 'Bu tədbir artıq başa çatıb.' });
    }

    const deadlineStr = event.registration_deadline || event.date;
    if (isDatePassed(deadlineStr)) {
      return res.status(400).json({ message: 'Bu tədbir üçün qeydiyyat müddəti bitib.' });
    }

    if (event.current_registrations >= event.capacity) {
      return res.status(400).json({ message: 'Tədbirdə boş yer qalmayıb.' });
    }

    const atomicInsertSql = `
      INSERT INTO registrations (user_id, event_id)
      SELECT ?, ?
      WHERE (
        SELECT COUNT(*) FROM registrations WHERE event_id = ?
      ) < (
        SELECT capacity FROM events WHERE id = ?
      )
    `;

    db.run(atomicInsertSql, [userId, eventId, eventId, eventId], function (insertErr) {
      if (insertErr) {
        if (insertErr.message && insertErr.message.includes('UNIQUE')) {
          return res.status(400).json({ message: 'Siz artıq bu tədbirə qeydiyyatdan keçmisiniz.' });
        }
        return res.status(500).json({ message: 'Qeydiyyat zamanı xəta baş verdi.' });
      }

      if (this.changes === 0) {
        return res.status(400).json({ message: 'Tədbirdə boş yer qalmayıb.' });
      }

      res.status(201).json({ message: 'Tədbirə qeydiyyatdan keçdiniz.' });
    });
  });
});

router.delete('/:id/register', authenticate, (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;

  const sql = `DELETE FROM registrations WHERE user_id = ? AND event_id = ?`;
  db.run(sql, [userId, eventId], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Xəta baş verdi.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Qeydiyyat tapılmadı.' });
    }
    res.json({ message: 'Qeydiyyatınız ləğv edildi.' });
  });
});

router.get('/:id/is-registered', authenticate, (req, res) => {
  const sql = `SELECT * FROM registrations WHERE user_id = ? AND event_id = ?`;
  db.get(sql, [req.user.id, req.params.id], (err, row) => {
    if (err) return res.status(500).json({ message: 'Xəta' });
    res.json({ isRegistered: !!row });
  });
});

router.post('/', authenticate, requireAdmin, (req, res) => {
  const { 
    title, 
    description, 
    date, 
    location, 
    capacity, 
    category = 'Konfranslar', 
    image_url = '', 
    status = 'Gələcəkdə',
    registration_deadline = ''
  } = req.body;

  if (!title || !description || !date || !location || capacity === undefined) {
    return res.status(400).json({ message: 'Bütün sahələri doldurun.' });
  }

  const numCapacity = Number(capacity);
  if (isNaN(numCapacity) || numCapacity <= 0) {
    return res.status(400).json({ message: 'Tutum müsbət ədəd olmalıdır.' });
  }

  if (status && !ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ message: `Yanlış status: ${status}` });
  }

  if (category && !ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: `Yanlış kateqoriya: ${category}` });
  }

  const sql = `
    INSERT INTO events (title, description, date, location, capacity, category, image_url, status, registration_deadline, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [title, description, date, location, numCapacity, category, image_url, status, registration_deadline, req.user.id],
    function (err) {
      if (err) {
        return res.status(500).json({ message: 'Tədbir yaradılarkən xəta baş verdi.' });
      }
      res.status(201).json({
        message: 'Tədbir uğurla yaradıldı.',
        event: { id: this.lastID, title, description, date, location, capacity: numCapacity, category, image_url, status, registration_deadline }
      });
    }
  );
});

router.put('/:id', authenticate, requireAdmin, (req, res) => {
  const eventId = req.params.id;
  const { 
    title, 
    description, 
    date, 
    location, 
    capacity, 
    category = 'Konfranslar', 
    image_url = '', 
    status = 'Gələcəkdə',
    registration_deadline = ''
  } = req.body;

  if (!title || !description || !date || !location || capacity === undefined) {
    return res.status(400).json({ message: 'Bütün sahələri doldurun.' });
  }

  const numCapacity = Number(capacity);
  if (isNaN(numCapacity) || numCapacity <= 0) {
    return res.status(400).json({ message: 'Tutum müsbət ədəd olmalıdır.' });
  }

  if (status && !ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ message: `Yanlış status: ${status}` });
  }
  if (category && !ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: `Yanlış kateqoriya: ${category}` });
  }

  const checkRegSql = `SELECT COUNT(*) AS current_regs FROM registrations WHERE event_id = ?`;
  db.get(checkRegSql, [eventId], (countErr, row) => {
    if (countErr) {
      return res.status(500).json({ message: 'Qeydiyyat sayı yoxlanılarkən xəta baş verdi.' });
    }

    const currentRegs = row ? row.current_regs : 0;
    if (numCapacity < currentRegs) {
      return res.status(400).json({ 
        message: `Tutum hazırkı qeydiyyat sayından (${currentRegs}) az ola bilməz.` 
      });
    }

    const sql = `
      UPDATE events
      SET title = ?, description = ?, date = ?, location = ?, capacity = ?, category = ?, image_url = ?, status = ?, registration_deadline = ?
      WHERE id = ?
    `;

    db.run(
      sql,
      [title, description, date, location, numCapacity, category, image_url, status, registration_deadline, eventId],
      function (err) {
        if (err) {
          return res.status(500).json({ message: 'Tədbir yenilənərkən xəta baş verdi.' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ message: 'Tədbir tapılmadı.' });
        }
        res.json({ message: 'Tədbir uğurla yeniləndi.' });
      }
    );
  });
});

router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  const sql = `DELETE FROM events WHERE id = ?`;
  db.run(sql, [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Tədbir silinərkən xəta baş verdi.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Tədbir tapılmadı.' });
    }
    res.json({ message: 'Tədbir uğurla silindi.' });
  });
});

router.get('/:id/attendees', authenticate, requireAdmin, (req, res) => {
  const sql = `
    SELECT u.id, u.name, u.email, r.registered_at
    FROM registrations r
    JOIN users u ON r.user_id = u.id
    WHERE r.event_id = ?
    ORDER BY r.registered_at DESC
  `;

  db.all(sql, [req.params.id], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Qeydiyyatçılar yüklənərkən xəta baş verdi.' });
    }
    res.json(rows);
  });
});

router.delete('/:id/attendees/:userId', authenticate, requireAdmin, (req, res) => {
  const eventId = req.params.id;
  const userId = req.params.userId;

  const sql = `DELETE FROM registrations WHERE event_id = ? AND user_id = ?`;
  db.run(sql, [eventId, userId], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Qeydiyyat silinərkən xəta baş verdi.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Qeydiyyat tapılmadı.' });
    }
    res.json({ message: 'İstifadəçi tədbir qeydiyyatından silindi.' });
  });
});

export default router;
