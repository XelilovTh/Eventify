// server/index.js
// Bu fayl Express serverinin ana giriş nöqtəsidir (entry point).
// Bütün middleware-lər, verilənlər bazası və API marşrutları burada birləşdirilir və server işə salınır.

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db.js';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware-lər
const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({
  origin: (origin, callback) => {
    // Yalnız http://localhost:5173 və ya mühitdə təyin edilmiş CLIENT_URL-ə icazə verilir
    if (!origin || origin === clientOrigin || origin === 'http://localhost:5173') {
      callback(null, true);
    } else {
      callback(new Error('CORS siyasəti tərəfindən bloklandı'));
    }
  },
  credentials: true
}));
app.use(express.json()); // Gələn JSON sorğularını oxuyur (req.body)

// Verilənlər bazasını inisializasiya edirik
initDB();

// API Marşrutları
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);

// Test üçün sadə status marşrutu
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Eventify Backend uğurla işləyir!' });
});

// Qlobal xəta idarəetməsi (CORS və s. xətaların təhlükəsiz ötürülməsi)
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ message: err.message });
  }
  console.error('Server daxili xətası:', err);
  res.status(500).json({ message: 'Daxili server xətası baş verdi.' });
});

export default app;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} ünvanında işə düşdü.`);
  });
}
