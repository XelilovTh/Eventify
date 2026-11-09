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

    // İlkin nümunə tədbirlər (Əgər tədbirlər cədvəlində say azdırsa)
    db.get(`SELECT COUNT(*) as count FROM events`, (err, row) => {
      if (row && row.count < 3) {
        const sampleEvents = [
          [
            'Müasir Veb Texnologiyaları Konfransı 2026',
            'React, TypeScript, Node.js və müasir mikroxidmət arxitekturaları haqqında ölkənin aparıcı mütəxəssislərinin çıxışları.',
            '2026-12-15 10:00',
            'Bakı, Heydər Əliyev Mərkəzi',
            50,
            1
          ],
          [
            'Süni İntellekt və Gələcəyin İxtisasları',
            'Maşın öyrənməsi, generativ süni intellekt və böyük dil modellərinin (LLM) biznesə tətbiqi seminarı.',
            '2026-12-20 14:00',
            'Bakı, ADA Universiteti',
            30,
            1
          ],
          [
            'UI/UX Dizayn və Rəqəmsal Məhsul İnkişafı',
            'Figma dizayn sistemləri, mobil interfeyslər və müasir istifadəçi təcrübəsinin araşdırılması üzrə intensiv vorkşop.',
            '2026-12-25 15:30',
            'Bakı, Landmark Plaza',
            40,
            1
          ],
          [
            'Kibertəhlükəsizlik Zirvəsi: Müasir Təhdidlər',
            'Şəbəkə təhlükəsizliyi, etik hakerlik, zəifliklərin aşkarlanması və məlumatların qorunması strategiyaları.',
            '2027-01-10 11:00',
            'Bakı, JW Marriott Absheron',
            120,
            1
          ],
          [
            'Startap İnkubasiyası və İnvestisiya İmkanları',
            'Erkən mərhələdə olan texnoloji startaplar üçün vençur fondları və mələk investorlarla təkbətək görüşlər.',
            '2027-01-18 16:00',
            'Bakı, Sabah Hub İnnovasiya Mərkəzi',
            60,
            1
          ],
          [
            'Mobil Tətbiq İnkişafı: Flutter & React Native',
            'Cross-platform mobil tətbiqlərin yaradılması, animasiyalar, yerli cihaz imkanları və App Store/Play Store buraxılışı.',
            '2027-02-05 13:00',
            'Bakı Mühəndislik Universiteti',
            45,
            1
          ],
          [
            'Bulud Texnologiyaları və DevOps Praktikaları',
            'Docker, Kubernetes orkestrasiyası, CI/CD boru kəmərləri və AWS bulud infrastrukturunun qurulması.',
            '2027-02-14 10:30',
            'Bakı, Hyatt Regency',
            70,
            1
          ],
          [
            'Data Elmi və Böyük Verilənlər (Big Data) Forumu',
            'Python ilə statistik modelləşdirmə, SQL optimizasiyası və böyük məlumat bazalarının analitikası.',
            '2027-02-28 14:00',
            'Bakı, Park İnn Hotel',
            80,
            1
          ],
          [
            'İT Mütəxəssisləri üçün Şəbəkələşmə (Networking) Gecəsi',
            'Təcrübəli proqramçılar, mühəndislər və İT şirkət rəhbərləri ilə qeyri-rəsmi ünsiyyət və karyera imkanları axşamı.',
            '2027-03-08 19:00',
            'Bakı, Çıraq Plaza',
            50,
            1
          ]
        ];

        const stmt = db.prepare(`
          INSERT INTO events (title, description, date, location, capacity, created_by)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        sampleEvents.forEach((ev) => stmt.run(ev));
        stmt.finalize(() => {
          console.log('9 ədəd zəngin nümunə tədbir bazaya əlavə edildi.');
        });
      }
    });
  });
};

export default db;
