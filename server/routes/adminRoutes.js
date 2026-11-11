import express from 'express';
import db from '../db.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/stats', (req, res) => {
  const stats = {};

  db.get(`SELECT COUNT(*) AS total_events FROM events`, (err, row1) => {
    stats.totalEvents = row1 ? row1.total_events : 0;

    db.get(`SELECT COUNT(*) AS total_users FROM users`, (err, row2) => {
      stats.totalUsers = row2 ? row2.total_users : 0;

      db.get(`SELECT COUNT(*) AS total_registrations FROM registrations`, (err, row3) => {
        stats.totalRegistrations = row3 ? row3.total_registrations : 0;
        res.json(stats);
      });
    });
  });
});

router.get('/users', (req, res) => {
  const sql = `SELECT id, name, email, role FROM users ORDER BY id DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'İstifadəçilər yüklənərkən xəta baş verdi.' });
    }
    res.json(rows);
  });
});

router.delete('/users/:id', (req, res) => {
  const targetId = Number(req.params.id);

  if (targetId === req.user.id) {
    return res.status(400).json({ message: 'Admin öz hesabını silə bilməz.' });
  }

  const sql = `DELETE FROM users WHERE id = ?`;
  db.run(sql, [targetId], function (err) {
    if (err) {
      return res.status(500).json({ message: 'İstifadəçi silinərkən xəta baş verdi.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'İstifadəçi tapılmadı.' });
    }
    res.json({ message: 'İstifadəçi silindi.' });
  });
});

export default router;
