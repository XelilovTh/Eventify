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
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Brauzersiz sorğulara (məs: curl/Postman) və ya icazəli domenlərə icazə veririk
    if (!origin || allowedOrigins.includes(origin)) {
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

app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} ünvanında işə düşdü.`);
});
