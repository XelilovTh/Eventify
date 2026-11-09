import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../db.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'eventify_production_secure_jwt_token_key_nov_2026';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Giriş icazəsi yoxdur.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token etibarsızdır və ya vaxtı bitib.' });
    }

    db.get('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id], (dbErr, user) => {
      if (dbErr || !user) {
        return res.status(401).json({ message: 'İstifadəçi tapılmadı və ya silinib.' });
      }
      req.user = user;
      next();
    });
  });
};

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Yalnız admin icazəsi tələb olunur.' });
  }
};
