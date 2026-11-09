// server/db.js
// Bu fayl SQLite verilənlər bazasını yaradır və kateqoriya, şəkil və status sütunları ilə tədbirləri idarə edir.

import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Baza ilə əlaqə xətası:', err.message);
  } else {
    console.log('SQLite verilənlər bazasına uğurla qoşuldu.');
    // SQLite-da xarici açarları (Foreign Keys & ON DELETE CASCADE) aktivləşdiririk
    db.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
      if (pragmaErr) {
        console.error('PRAGMA foreign_keys xətası:', pragmaErr);
      } else {
        console.log('SQLite Foreign Keys uğurla aktivləşdirildi (PRAGMA foreign_keys = ON).');
      }
    });
  }
});

export const initDB = () => {
  db.serialize(() => {
    // 1. İstifadəçilər cədvəli
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin'))
      )
    `);

    // 2. Tədbirlər cədvəli (Yeni: category, image_url, status əlavə edildi)
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

    // Əgər köhnə cədvəldə bu sütunlar yoxdursa əlavə edək (migration)
    const alterColumns = [
      `ALTER TABLE events ADD COLUMN category TEXT DEFAULT 'Konfranslar'`,
      `ALTER TABLE events ADD COLUMN image_url TEXT`,
      `ALTER TABLE events ADD COLUMN status TEXT DEFAULT 'Gələcəkdə'`,
      `ALTER TABLE events ADD COLUMN registration_deadline TEXT`
    ];
    alterColumns.forEach(sql => {
      db.run(sql, () => {}); // Mövcuddursa səssizcə keçir
    });

    // 3. Qeydiyyatlar cədvəli
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

    // Standart Admin
    const checkAdminSql = `SELECT * FROM users WHERE email = ?`;
    db.get(checkAdminSql, ['admin@eventify.com'], (err, row) => {
      if (!row) {
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        db.run(
          `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
          ['Admin', 'admin@eventify.com', hashedPassword, 'admin'],
          () => console.log('Admin hesabı yaradıldı: admin@eventify.com / admin123')
        );
      }
    });
  });
};

export default db;
