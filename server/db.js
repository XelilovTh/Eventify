// server/db.js
// Bu fayl SQLite verilənlər bazası faylını (database.sqlite) yaradır, əlaqə qurur 
// və layihəmiz üçün zəruri olan 3 əsas cədvəli (users, events, registrations) işə salır.

import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

// Bazanın diskdə saxlanacağı fayl adı
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Baza ilə əlaqə xətası:', err.message);
  } else {
    console.log('SQLite verilənlər bazasına uğurla qoşuldu.');
  }
});

// Cədvəlləri yaradan funksiya
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

    // 2. Tədbirlər cədvəli
    db.run(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        date TEXT NOT NULL,
        location TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        created_by INTEGER,
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `);

    // 3. Qeydiyyatlar cədvəli
    // QEYD: UNIQUE(user_id, event_id) təmin edir ki, bir istifadəçi eyni tədbirə 2 dəfə yazıla bilməz!
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

    // İlkin Admin istifadəçisinin mövcudluğunu yoxlayaq, yoxdursa yaradaq
    // Giriş: admin@eventify.com / Şifrə: admin123
    const checkAdminSql = `SELECT * FROM users WHERE email = ?`;
    db.get(checkAdminSql, ['admin@eventify.com'], (err, row) => {
      if (!row) {
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        db.run(
          `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
          ['Admin', 'admin@eventify.com', hashedPassword, 'admin'],
          (err) => {
            if (!err) {
              console.log('Standart Admin hesabı yaradıldı: admin@eventify.com / admin123');
            }
          }
        );
      }
    });

    // İlkin nümunə tədbirlər (Əgər tədbirlər cədvəli boşdursa)
    db.get(`SELECT COUNT(*) as count FROM events`, (err, row) => {
      if (row && row.count === 0) {
        const sampleEvents = [
          [
            'Müasir Veb Texnologiyaları Konfransı 2026',
            'React, TypeScript, Node.js və müasir arxitekturalar haqqında geniş müzakirə.',
            '2026-12-15 10:00',
            'Bakı, Heydər Əliyev Mərkəzi',
            50,
            1
          ],
          [
            'Süni İntellekt və Gələcəyin İxtisasları',
            'Maşın öyrənməsi və süni intellektin tətbiq sahələrinə baxış seminarı.',
            '2026-12-22 14:00',
            'Bakı, ADA Universiteti',
            30,
            1
          ]
        ];

        const stmt = db.prepare(`
          INSERT INTO events (title, description, date, location, capacity, created_by)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        sampleEvents.forEach((ev) => stmt.run(ev));
        stmt.finalize(() => {
          console.log('İlkin nümunə tədbirlər bazaya əlavə edildi.');
        });
      }
    });
  });
};

export default db;
