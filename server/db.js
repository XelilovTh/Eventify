import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Baza xətası:', err.message);
  } else {
    db.run('PRAGMA foreign_keys = ON;');
  }
});

export const initDB = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin'))
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        date TEXT NOT NULL,
        location TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        category TEXT DEFAULT 'Konfranslar',
        image_url TEXT,
        status TEXT DEFAULT 'Gələcəkdə',
        registration_deadline TEXT,
        created_by INTEGER,
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `);

    const alterColumns = [
      `ALTER TABLE events ADD COLUMN category TEXT DEFAULT 'Konfranslar'`,
      `ALTER TABLE events ADD COLUMN image_url TEXT`,
      `ALTER TABLE events ADD COLUMN status TEXT DEFAULT 'Gələcəkdə'`,
      `ALTER TABLE events ADD COLUMN registration_deadline TEXT`
    ];
    alterColumns.forEach(sql => {
      db.run(sql, () => {});
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        event_id INTEGER NOT NULL,
        registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, event_id),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
      )
    `);

    const checkAdminSql = `SELECT * FROM users WHERE email = ?`;
    db.get(checkAdminSql, ['admin@eventify.com'], (err, row) => {
      if (!row) {
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        db.run(
          `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
          ['Admin', 'admin@eventify.com', hashedPassword, 'admin']
        );
      }
    });

    db.get('SELECT COUNT(*) as count FROM events', (err, row) => {
      if (!err && row && row.count === 0) {
        const stmt = db.prepare(`
          INSERT INTO events (title, description, date, location, capacity, category, image_url, status, registration_deadline, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const initialEvents = [
          ['Texnologiya Konfransı 2025', 'Müasir proqram təminatı, süni intellekt və bulud texnologiyaları üzrə illik konfrans.', '15 Noyabr 2026, 10:00', 'Bakı Konqres Mərkəzi', 120, 'Texnologiya', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80', 'Gələcəkdə', '14 Noyabr 2026, 23:59', 1],
          ['Musiqi Festivalı', 'Canlı musiqi, elektron ritmlər və sənətçilərin çıxışları.', '20 Oktyabr 2026, 19:00', 'Bakı İdman Sarayı', 50, 'Festivallar', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80', 'Davam edir', '19 Oktyabr 2026, 23:59', 1],
          ['Biznes Forumu', 'İnvestisiya, idarəetmə və qlobal bazarlara çıxış strategiyaları haqqında müzakirələr.', '10 Oktyabr 2026, 09:00', 'Bakı Expo Center', 80, 'Seminarlar', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1000&q=80', 'Bitib', '09 Oktyabr 2026, 23:59', 1],
          ['İncəsənət Sərgisi', 'Klassik və müasir rəngkarlıq, heykəltəraşlıq əsərlərinin nümayişi.', '25 Noyabr 2026, 12:00', 'Heydər Əliyev Mərkəzi', 80, 'İncəsənət', 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1000&q=80', 'Gələcəkdə', '24 Noyabr 2026, 23:59', 1],
          ['Kibertəhlükəsizlik Zirvəsi', 'İnformasiya təhlükəsizliyi və yeni nəsil kiber təhdidlər.', '18 Noyabr 2026, 11:00', 'Four Seasons Hotel', 100, 'Texnologiya', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80', 'Gələcəkdə', '17 Noyabr 2026, 23:59', 1],
          ['Gənclər Marafonu', 'Sağlam həyat tərzi və idmanın təbliği üçün kütləvi qaçış marafonu.', '01 Dekabr 2026, 08:30', 'Dənizkənarı Milli Park', 200, 'İdman', 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1000&q=80', 'Gələcəkdə', '30 Noyabr 2026, 23:59', 1]
        ];
        initialEvents.forEach(ev => stmt.run(ev));
        stmt.finalize();
      }
    });
  });
};

export default db;
