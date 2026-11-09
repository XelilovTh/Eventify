// server/seed.js
import db from './db.js';

db.serialize(() => {
  db.run('DELETE FROM events');
  db.run('DELETE FROM registrations');

  const events = [
    [
      'Texnologiya Konfransı 2025',
      'Müasir proqram təminatı, süni intellekt və bulud texnologiyaları üzrə ölkənin ən böyük texnoloji konfransı.',
      '15 Noyabr 2026, 10:00',
      'Bakı Konqres Mərkəzi',
      120,
      'Konfranslar',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
      'Gələcəkdə',
      1
    ],
    [
      'Musiqi Festivalı',
      'Canlı musiqi, elektron ritmlər və məşhur yerli və xarici sənətçilərin möhtəşəm çıxışları.',
      '20 Oktyabr 2026, 19:00',
      'Bakı İdman Sarayı',
      50,
      'Festivallar',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80',
      'Davam edir',
      1
    ],
    [
      'Biznes Forumu',
      'İnvestisiya, korporativ idarəetmə və qlobal bazarlara çıxış strategiyaları haqqında panel müzakirələri.',
      '10 Oktyabr 2026, 09:00',
      'Bakı Expo Center',
      80,
      'Seminarlar',
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1000&q=80',
      'Bitib',
      1
    ],
    [
      'İncəsənət Sərgisi',
      'Klassik və müasir rəngkarlıq, heykəltəraşlıq və instalyasiya əsərlərinin xüsusi nümayişi.',
      '25 Noyabr 2026, 12:00',
      'Heydər Əliyev Mərkəzi',
      80,
      'Digər',
      'https://images.unsplash.com/photo-1531247483471-9299c65604d0?auto=format&fit=crop&w=1000&q=80',
      'Gələcəkdə',
      1
    ],
    [
      'Proqramlaşdırma Bootcamp',
      'Fullstack veb proqramlaşdırma, arxitektura və real layihələrin hazırlanması üzrə intensiv təlim.',
      '1 Dekabr 2026, 09:00',
      'ADA Universiteti',
      60,
      'Seminarlar',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80',
      'Gələcəkdə',
      1
    ],
    [
      'Futbol Turniri',
      'Həvəskar komandalar arasında həyəcanverici şəhər kuboku çempionatı və mükafatlandırma mərasimi.',
      '18 Oktyabr 2026, 15:00',
      'Dalğa Arena',
      30,
      'İdman',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80',
      'Davam edir',
      1
    ]
  ];

  const stmt = db.prepare(`
    INSERT INTO events (title, description, date, location, capacity, category, image_url, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  events.forEach(ev => stmt.run(ev));
  stmt.finalize(() => {
    console.log('Şəkildəki 6 real tədbir uğurla bazaya yazıldı!');
    process.exit(0);
  });
});
