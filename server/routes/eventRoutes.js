// server/routes/eventRoutes.js
// Bu fayl tədbirlərin idarə edilməsi (baxış, yaratma, yeniləmə, silmə)
// və istifadəçilərin tədbirlərə qeydiyyatdan keçməsi üçün API nöqtələrini təmin edir.

import express from 'express';
import db from '../db.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Tarix sətirlərini millisaniyəyə çevirən funksiya
const parseEventDate = (dateStr) => {
  if (!dateStr) return 0;
  const months = {
    yanvar: 0, fevral: 1, mart: 2, aprel: 3, may: 4, iyun: 5,
    iyul: 6, avqust: 7, sentyabr: 8, oktyabr: 9, noyabr: 10, dekabr: 11
  };
  const parsedDirect = Date.parse(dateStr);
  if (!isNaN(parsedDirect)) return parsedDirect;

  const clean = dateStr.replace(/,/g, '').replace(/–/g, '-');
  const parts = clean.split(' ').filter(Boolean);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const monthName = parts[1].toLowerCase();
    const year = parseInt(parts[2], 10);
    let hours = 23;
    let minutes = 59;
    if (parts[3] && parts[3].includes(':')) {
      const timeParts = parts[3].split(':');
      hours = parseInt(timeParts[0], 10) || 0;
      minutes = parseInt(timeParts[1], 10) || 0;
    }
    if (months[monthName] !== undefined && !isNaN(day) && !isNaN(year)) {
      return new Date(year, months[monthName], day, hours, minutes).getTime();
    }
  }
  return 0;
};

// ==========================================
// 1. TƏDBİRLƏRİN BAXIŞI (HƏR KƏS ÜÇÜN AÇIQDIR)
// ==========================================

// Bütün tədbirləri gətir (hər tədbir üçün qeydiyyatdan keçənlərin sayını da hesablayır)
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
    res.json(rows);
  });
});

// Daxil olmuş istifadəçinin qeydiyyatdan keçdiyi tədbirləri gətir
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

// Tək bir tədbirin detallarını gətir
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

// ==========================================
// 2. TƏDBİR QEYDİYYATI (DAXİL OLMUŞ İSTİFADƏÇİ)
// ==========================================

// Tədbirə qeydiyyatdan keçmək
router.post('/:id/register', authenticate, (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;

  // 1-ci Addım: Tədbiri və mövcud qeydiyyat sayını tapırıq
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

    // 2-ci Addım: Tədbirin statusunu yoxlayırıq (Bitib və ya Davam edirsə qeydiyyat qadağandır)
    const statusNormalized = event.status ? event.status.trim().toLowerCase() : '';
    if (statusNormalized === 'bitib') {
      return res.status(400).json({ message: 'Bu tədbir artıq başa çatıb. Qeydiyyat mümkün deyil.' });
    }
    if (statusNormalized === 'davam edir') {
      return res.status(400).json({ message: 'Tədbir artıq başlayıb və davam edir. Yeni qeydiyyat dayandırılıb.' });
    }

    // 3-cü Addım: Son qeydiyyat tarixini yoxlayırıq
    const deadlineStr = event.registration_deadline || event.date;
    const deadlineTime = parseEventDate(deadlineStr);
    if (deadlineTime > 0 && Date.now() > deadlineTime) {
      return res.status(400).json({ message: 'Bu tədbir üçün son qeydiyyat tarixi artıq bitib. Qeydiyyat qəbul olunmur.' });
    }

    // 4-cü Addım: İlkin yer limitini yoxlayırıq
    if (event.current_registrations >= event.capacity) {
      return res.status(400).json({ message: 'Təəssüf ki, tədbirdə boş yer qalmayıb.' });
    }

    // 5-ci Addım: Atomik Qeydiyyat (Race condition və overbooking qarşısını 100% alır)
    // Şərt: Yalnız həmin an bazadakı qeydiyyat sayı tutumdan azdırsa sətir əlavə olunur
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
        // Əgər bazada UNIQUE(user_id, event_id) constraint pozularsa
        if (insertErr.message && insertErr.message.includes('UNIQUE')) {
          return res.status(400).json({ message: 'Siz artıq bu tədbirə qeydiyyatdan keçmisiniz.' });
        }
        return res.status(500).json({ message: 'Qeydiyyat zamanı xəta baş verdi.' });
      }

      // Əgər dəyişiklik edilməyibsə (0 sətir), deməli paralel sorğu zamanı yer dolub
      if (this.changes === 0) {
        return res.status(400).json({ message: 'Təəssüf ki, tədbirdə boş yer qalmayıb.' });
      }

      res.status(201).json({ message: 'Tədbirə uğurla qeydiyyatdan keçdiniz!' });
    });
  });
});

// Qeydiyyatı ləğv etmək (istifadəçi öz istəyi ilə tədbirdən çıxır)
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
    res.json({ message: 'Qeydiyyatınız uğurla ləğv edildi.' });
  });
});

// İstifadəçinin qeydiyyat statusunu yoxlamaq (bu tədbirə yazılıb ya yox?)
router.get('/:id/is-registered', authenticate, (req, res) => {
  const sql = `SELECT * FROM registrations WHERE user_id = ? AND event_id = ?`;
  db.get(sql, [req.user.id, req.params.id], (err, row) => {
    if (err) return res.status(500).json({ message: 'Xəta' });
    res.json({ isRegistered: !!row });
  });
});

// ==========================================
// 3. ADMIN ƏMƏLİYYATLARI (CRUD)
// ==========================================

// Yeni tədbir yaratmaq
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
    return res.status(400).json({ message: 'Bütün vacib xanaları doldurmaq mütləqdir.' });
  }

  const numCapacity = Number(capacity);
  if (isNaN(numCapacity) || numCapacity <= 0) {
    return res.status(400).json({ message: 'Tutum ən azı 1 nəfər müsbət ədəd olmalıdır.' });
  }

  const sql = `
    INSERT INTO events (title, description, date, location, capacity, category, image_url, status, registration_deadline, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [title, description, date, location, Number(capacity), category, image_url, status, registration_deadline, req.user.id],
    function (err) {
      if (err) {
        return res.status(500).json({ message: 'Tədbir yaradılarkən xəta baş verdi.' });
      }
      res.status(201).json({
        message: 'Tədbir uğurla yaradıldı.',
        event: { id: this.lastID, title, description, date, location, capacity: Number(capacity), category, image_url, status, registration_deadline }
      });
    }
  );
});

// Tədbiri redaktə etmək
router.put('/:id', authenticate, requireAdmin, (req, res) => {
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

  const numCapacity = Number(capacity);
  if (capacity !== undefined && (isNaN(numCapacity) || numCapacity <= 0)) {
    return res.status(400).json({ message: 'Tutum ən azı 1 nəfər müsbət ədəd olmalıdır.' });
  }

  const sql = `
    UPDATE events
    SET title = ?, description = ?, date = ?, location = ?, capacity = ?, category = ?, image_url = ?, status = ?, registration_deadline = ?
    WHERE id = ?
  `;

  db.run(
    sql,
    [title, description, date, location, Number(capacity), category, image_url, status, registration_deadline, req.params.id],
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

// Tədbiri silmək
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

// Tədbirə qeydiyyatdan keçənlərin siyahısı (Admin Dashboard üçün)
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

// Admin tərəfindən istifadəçinin tədbir qeydiyyatının silinməsi
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
    res.json({ message: 'İstifadəçi tədbir qeydiyyatından uğurla silindi.' });
  });
});

export default router;
