// server/routes/eventRoutes.js
// Bu fayl tədbirlərin idarə edilməsi (baxış, yaratma, yeniləmə, silmə)
// və istifadəçilərin tədbirlərə qeydiyyatdan keçməsi üçün API nöqtələrini təmin edir.

import express from 'express';
import db from '../db.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

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

    // 2-ci Addım: Tədbirin bitib-bitmədiyini yoxlayırıq
    if (event.status === 'Bitib') {
      return res.status(400).json({ message: 'Bu tədbir artıq başa çatıb. Qeydiyyat mümkün deyil.' });
    }

    // 3-cü Addım: Yer limitini yoxlayırıq
    if (event.current_registrations >= event.capacity) {
      return res.status(400).json({ message: 'Təəssüf ki, tədbirdə boş yer qalmayıb.' });
    }

    // 4-cü Addım: İstifadəçinin əvvəlcədən yazılıb-yazılmadığını yoxlayırıq
    const checkSql = `SELECT * FROM registrations WHERE user_id = ? AND event_id = ?`;
    db.get(checkSql, [userId, eventId], (err, existing) => {
      if (existing) {
        return res.status(400).json({ message: 'Siz artıq bu tədbirə qeydiyyatdan keçmisiniz.' });
      }

      // 4-cü Addım: Qeydiyyatı bazaya yazırıq
      const insertSql = `INSERT INTO registrations (user_id, event_id) VALUES (?, ?)`;
      db.run(insertSql, [userId, eventId], function (err) {
        if (err) {
          return res.status(500).json({ message: 'Qeydiyyat zamanı xəta baş verdi.' });
        }
        res.status(201).json({ message: 'Tədbirə uğurla qeydiyyatdan keçdiniz!' });
      });
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
    status = 'Gələcəkdə' 
  } = req.body;

  if (!title || !description || !date || !location || !capacity) {
    return res.status(400).json({ message: 'Bütün vacib xanaları doldurmaq mütləqdir.' });
  }

  const sql = `
    INSERT INTO events (title, description, date, location, capacity, category, image_url, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [title, description, date, location, Number(capacity), category, image_url, status, req.user.id],
    function (err) {
      if (err) {
        return res.status(500).json({ message: 'Tədbir yaradılarkən xəta baş verdi.' });
      }
      res.status(201).json({
        message: 'Tədbir uğurla yaradıldı.',
        event: { id: this.lastID, title, description, date, location, capacity: Number(capacity), category, image_url, status }
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
    status = 'Gələcəkdə' 
  } = req.body;

  const sql = `
    UPDATE events
    SET title = ?, description = ?, date = ?, location = ?, capacity = ?, category = ?, image_url = ?, status = ?
    WHERE id = ?
  `;

  db.run(
    sql,
    [title, description, date, location, Number(capacity), category, image_url, status, req.params.id],
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
