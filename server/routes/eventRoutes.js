// server/routes/eventRoutes.js
// Bu fayl tədbirlərin idarə edilməsi (baxış, yaratma, yeniləmə, silmə)
// və istifadəçilərin tədbirlərə qeydiyyatdan keçməsi üçün API nöqtələrini təmin edir.

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

    // 2-ci Addım: Tədbir admin tərəfindən 'Bitib' kimi qeyd olunubsa qeydiyyat qadağandır
    const statusNormalized = event.status ? event.status.trim().toLowerCase() : '';
    if (statusNormalized === 'bitib') {
      return res.status(400).json({ message: 'Bu tədbir artıq başa çatıb. Qeydiyyat mümkün deyil.' });
    }

    // 3-cü Addım: Son qeydiyyat tarixini tək həqiqət mənbəyi kimi yoxlayırıq
    const deadlineStr = event.registration_deadline || event.date;
    if (isDatePassed(deadlineStr)) {
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

  if (status && !ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ message: `Yanlış status. İcazə verilən: ${ALLOWED_STATUSES.join(', ')}` });
  }

  if (category && !ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: `Yanlış kateqoriya. İcazə verilən: ${ALLOWED_CATEGORIES.join(', ')}` });
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

// Tədbiri redaktə etmək (Bütün sahələrin və tutumun mövcud qeydiyyat sayından az olmamasının yoxlanışı)
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

  // 1. Vacib xanaların mövcudluğu
  if (!title || !description || !date || !location || capacity === undefined) {
    return res.status(400).json({ message: 'Bütün vacib xanaları doldurmaq mütləqdir.' });
  }

  // 2. Tutumun düzgünlüyü
  const numCapacity = Number(capacity);
  if (isNaN(numCapacity) || numCapacity <= 0) {
    return res.status(400).json({ message: 'Tutum ən azı 1 nəfər müsbət ədəd olmalıdır.' });
  }

  // 3. Status və kateqoriyanın düzgünlüyü
  if (status && !ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ message: `Yanlış status. İcazə verilən: ${ALLOWED_STATUSES.join(', ')}` });
  }
  if (category && !ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: `Yanlış kateqoriya. İcazə verilən: ${ALLOWED_CATEGORIES.join(', ')}` });
  }

  // 4. Tutum hazırkı qeydiyyat sayından az ola bilməz
  const checkRegSql = `SELECT COUNT(*) AS current_regs FROM registrations WHERE event_id = ?`;
  db.get(checkRegSql, [eventId], (countErr, row) => {
    if (countErr) {
      return res.status(500).json({ message: 'Qeydiyyat sayı yoxlanılarkən xəta baş verdi.' });
    }

    const currentRegs = row ? row.current_regs : 0;
    if (numCapacity < currentRegs) {
      return res.status(400).json({ 
        message: `Tutum hazırkı qeydiyyat sayından (${currentRegs} nəfər) az ola bilməz.` 
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
