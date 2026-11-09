// server/middleware/authMiddleware.js
// Bu fayl gələn HTTP sorğularında JWT tokeni yoxlayır və istifadəçinin sistemə 
// daxil olub-olmadığını (və admin olub-olmadığını) təsdiqləyən middleware funksiyaları təqdim edir.

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Kritik xəta: JWT_SECRET mühit dəyişəni təyin olunmayıb. Server işə düşə bilməz.');
}

// 1. İstifadəçinin daxil olduğunu (tokenin etibarlı olduğunu) yoxlayan middleware
export const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Token adətən "Bearer eyJhbGciOi..." formatında gəlir
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Giriş icazəsi yoxdur: Token tapılmadı.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token etibarsızdır və ya vaxtı bitib.' });
    }
    // Token düzgündürsə, istifadəçi məlumatlarını sorğu obyektinə (req.user) əlavə edirik
    req.user = user;
    next();
  });
};

// 2. Yalnız 'admin' roluna malik istifadəçilərə icazə verən middleware
export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // Admin-dir, davam etsin
  } else {
    res.status(403).json({ message: 'Bu əməliyyat üçün yalnız Admin icazəsi tələb olunur.' });
  }
};
