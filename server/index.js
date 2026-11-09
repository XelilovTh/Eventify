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

const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = clientOrigin.split(',').map((o) => o.trim().replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin === 'http://localhost:5173' ||
      origin === 'http://localhost:3000' ||
      origin.endsWith('.vercel.app')
    ) {
      callback(null, true);
    } else {
      callback(new Error('CORS siyasəti tərəfindən bloklandı'));
    }
  },
  credentials: true
}));
app.use(express.json());

initDB();

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Eventify Backend işləyir' });
});

app.use((err, req, res, next) => {
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ message: err.message });
  }
  console.error('Server xətası:', err);
  res.status(500).json({ message: 'Daxili server xətası baş verdi.' });
});

export default app;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda dinləyir`);
  });
}
