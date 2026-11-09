import db from './db.js';

db.serialize(() => {
  db.run('DELETE FROM events');
  db.run('DELETE FROM registrations');

  const events = [
    [
      'Texnologiya Konfransı 2025',
      'Müasir proqram təminatı, süni intellekt və bulud texnologiyaları üzrə illik konfrans.',
      '15 Noyabr 2026, 10:00',
      'Bakı Konqres Mərkəzi',
      120,
      'Texnologiya',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
      'Gələcəkdə',
      '14 Noyabr 2026, 23:59',
      1
    ],
    [
      'Musiqi Festivalı',
      'Canlı musiqi, elektron ritmlər və sənətçilərin çıxışları.',
      '20 Oktyabr 2026, 19:00',
      'Bakı İdman Sarayı',
      50,
      'Festivallar',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80',
      'Davam edir',
      '19 Oktyabr 2026, 23:59',
      1
    ],
    [
      'Biznes Forumu',
      'İnvestisiya, idarəetmə və qlobal bazarlara çıxış strategiyaları haqqında müzakirələr.',
      '10 Oktyabr 2026, 09:00',
      'Bakı Expo Center',
      80,
      'Seminarlar',
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1000&q=80',
      'Bitib',
      '09 Oktyabr 2026, 23:59',
      1
    ],
    [
      'İncəsənət Sərgisi',
      'Klassik və müasir rəngkarlıq, heykəltəraşlıq əsərlərinin nümayişi.',
      '25 Noyabr 2026, 12:00',
      'Heydər Əliyev Mərkəzi',
      80,
      'İncəsənət',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80',
      'Gələcəkdə',
      '24 Noyabr 2026, 23:59',
      1
    ],
    [
      'Proqramlaşdırma Bootcamp',
      'Fullstack veb proqramlaşdırma, arxitektura və layihələrin hazırlanması üzrə təlim.',
      '1 Dekabr 2026, 09:00',
      'ADA Universiteti',
      60,
      'Seminarlar',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80',
      'Gələcəkdə',
      '30 Noyabr 2026, 23:59',
      1
    ],
    [
      'Futbol Turniri',
      'Həvəskar komandalar arasında şəhər kuboku çempionatı və mükafatlandırma.',
      '18 Oktyabr 2026, 15:00',
      'Dalğa Arena',
      30,
      'İdman',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=80',
      'Davam edir',
      '17 Oktyabr 2026, 23:59',
      1
    ]
  ];

  const stmt = db.prepare(`
    INSERT INTO events (title, description, date, location, capacity, category, image_url, status, registration_deadline, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  events.forEach(ev => stmt.run(ev));
  stmt.finalize(() => {
    console.log('Tədbirlər bazaya yazıldı.');
    process.exit(0);
  });
});
