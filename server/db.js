import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'database.sqlite');

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
  });
};

export default db;
