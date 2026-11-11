import jwt from 'jsonwebtoken';
import db from '../db.js';
import { JWT_SECRET } from '../config.js';

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
