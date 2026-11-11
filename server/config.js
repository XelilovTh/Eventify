import dotenv from 'dotenv';
dotenv.config();

const rawJwtSecret = process.env.JWT_SECRET;

if (!rawJwtSecret && process.env.NODE_ENV === 'production') {
  throw new Error('KRİTİK TƏHLÜKƏSİZLİK XƏTASI: JWT_SECRET mühit dəyişəni təyin edilməyib!');
}

if (!rawJwtSecret && process.env.NODE_ENV !== 'test') {
  console.warn('⚠️ XƏBƏRDARLIQ: .env faylında JWT_SECRET təyin edilməyib. Yalnız lokal inkişaf üçün müvəqqəti açar istifadə olunur.');
}

export const JWT_SECRET = rawJwtSecret || 'eventify_dev_jwt_secret_key_local_only';
export const PORT = process.env.PORT || 5000;
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
