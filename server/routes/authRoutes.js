// server/routes/authRoutes.js
// Bu fayl istifadəçilərin qeydiyyatı (Register), sistemə girişi (Login) 
// və daxil olmuş istifadəçinin məlumatlarını almaq (Me) üçün API endpoint-lərini təmin edir.

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// 1. Qeydiyyat (Register)
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  // Sadə validasiya: Boş sahə olmamalıdır
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Zəhmət olmasa bütün xanaları doldurun.' });
  }

  // E-poçtun artıq mövcud olub-olmadığını yoxlayırıq
  const checkSql = `SELECT * FROM users WHERE email = ?`;
  db.get(checkSql, [email.toLowerCase()], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Baza xətası baş verdi.' });
    }
    if (user) {
      return res.status(400).json({ message: 'Bu e-poçt ünvanı artıq qeydiyyatdan keçib.' });
    }

    // Şifrəni bcrypt ilə hash-ləyirik (təhlükəsizlik üçün)
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    const insertSql = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')`;
    db.run(insertSql, [name, email.toLowerCase(), hashedPassword], function (err) {
      if (err) {
        return res.status(500).json({ message: 'İstifadəçi yaradılarkən xəta baş verdi.' });
      }

      // Yeni istifadəçi üçün JWT token hazırlayırıq
      const newUserId = this.lastID;
      const token = jwt.sign(
        { id: newUserId, email: email.toLowerCase(), role: 'user' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Qeydiyyat uğurla tamamlandı.',
        token,
        user: { id: newUserId, name, email: email.toLowerCase(), role: 'user' }
      });
    });
  });
});

// 2. Giriş (Login)
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'E-poçt və şifrəni daxil edin.' });
  }

  const findSql = `SELECT * FROM users WHERE email = ?`;
  db.get(findSql, [email.toLowerCase()], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Baza xətası baş verdi.' });
    }
    if (!user) {
      return res.status(400).json({ message: 'E-poçt və ya şifrə yanlışdır.' });
    }

    // Şifrənin doğruluğunu yoxlayırıq
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'E-poçt və ya şifrə yanlışdır.' });
    }

    // Uğurlu giriş - JWT token generasiya edirik
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Uğurla daxil oldunuz.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });
});

// 3. Cari İstifadəçi Məlumatı (Me - Token ilə profil məlumatını almaq)
router.get('/me', authenticate, (req, res) => {
  const findSql = `SELECT id, name, email, role FROM users WHERE id = ?`;
  db.get(findSql, [req.user.id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ message: 'İstifadəçi tapılmadı.' });
    }
    res.json({ user });
  });
});

// 4. Profil Məlumatlarını Yeniləmək (Ad və ya Şifrə)
router.put('/profile', authenticate, (req, res) => {
  const { name, newPassword } = req.body;
  const userId = req.user.id;

  if (!name) {
    return res.status(400).json({ message: 'Ad boş ola bilməz.' });
  }

  if (newPassword && newPassword.trim() !== '') {
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Yeni şifrə ən azı 6 simvoldan ibarət olmalıdır.' });
    }
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    const sql = `UPDATE users SET name = ?, password = ? WHERE id = ?`;
    db.run(sql, [name, hashedPassword, userId], function (err) {
      if (err) return res.status(500).json({ message: 'Profil yenilənərkən xəta baş verdi.' });
      res.json({
        message: 'Profil və şifrə uğurla yeniləndi.',
        user: { id: userId, name, email: req.user.email, role: req.user.role }
      });
    });
  } else {
    const sql = `UPDATE users SET name = ? WHERE id = ?`;
    db.run(sql, [name, userId], function (err) {
      if (err) return res.status(500).json({ message: 'Profil yenilənərkən xəta baş verdi.' });
      res.json({
        message: 'Profil adı uğurla yeniləndi.',
        user: { id: userId, name, email: req.user.email, role: req.user.role }
      });
    });
  }
});

export default router;
