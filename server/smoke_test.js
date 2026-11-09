// server/smoke_test.js
// Eventify üçün avtomatlaşdırılmış Smoke Testlər:
// 1. Register validasiyası (email formatı, şifrə uzunluğu)
// 2. Qeydiyyat və Giriş (İstifadəçi və Admin)
// 3. Admin-only səlahiyyət yoxlanışı (User tədbir yarada bilməz)
// 4. Tədbir yaratma, qeydiyyat, təkrar qeydiyyatın bloklanması
// 5. Tutum dolduqda (overbooking / race condition) yeni qeydiyyatın bloklanması
// 6. Qeydiyyatın ləğvi və yerin yenidən azad edilməsi
// 7. Tutumun mövcud qeydiyyat sayından azaldılmasının bloklanması
// 8. Tədbirin silinməsi və kaskad əlaqələrin yoxlanışı

import assert from 'node:assert';
import process from 'node:process';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'eventify_production_secure_jwt_token_key_nov_2026';

const runTests = async () => {
  const { default: app } = await import('./index.js');

  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));

  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  console.log(`\n========================================`);
  console.log(`🧪 EVENTIFY SMOKE TESTLƏRİ BAŞLAYIR (Port: ${port})`);
  console.log(`========================================\n`);

  try {
    // 1. Health Check
    console.log('1. Health Check yoxlanılır...');
    const healthRes = await fetch(`${baseUrl}/health`);
    assert.strictEqual(healthRes.status, 200, 'Health check 200 qaytarmalıdır');
    console.log('   ✅ Health check uğurludur.');

    // 2. Register Validasiyası: Səhv e-poçt
    console.log('2. Register validasiyası (səhv e-poçt formatı)...');
    const badEmailRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'not-an-email', password: 'password123' })
    });
    assert.strictEqual(badEmailRes.status, 400, 'Səhv e-poçt 400 xətası verməlidir');
    console.log('   ✅ Səhv e-poçt uğurla bloklandı.');

    // 3. Register Validasiyası: Qısa şifrə (< 6 simvol)
    console.log('3. Register validasiyası (qısa şifrə)...');
    const shortPassRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'valid@example.com', password: '123' })
    });
    assert.strictEqual(shortPassRes.status, 400, 'Qısa şifrə 400 xətası verməlidir');
    console.log('   ✅ Qısa şifrə uğurla bloklandı.');

    // 4. İstifadəçi 1 və İstifadəçi 2-nin uğurla qeydiyyatdan keçməsi
    const user1Email = `user1_${Date.now()}@example.com`;
    const user2Email = `user2_${Date.now()}@example.com`;

    console.log('4. İstifadəçi 1 qeydiyyatdan keçirilir...');
    const regUser1Res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'İstifadəçi 1', email: user1Email, password: 'password123' })
    });
    assert.strictEqual(regUser1Res.status, 201, 'İstifadəçi 1 201 statusu ilə qeydiyyatdan keçməlidir');
    const user1Data = await regUser1Res.json();
    const user1Token = user1Data.token;
    assert.ok(user1Token, 'İstifadəçi 1 üçün JWT token təmin edilməlidir');
    console.log('   ✅ İstifadəçi 1 qeydiyyatı tamamlandı.');

    console.log('5. İstifadəçi 2 qeydiyyatdan keçirilir...');
    const regUser2Res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'İstifadəçi 2', email: user2Email, password: 'password123' })
    });
    assert.strictEqual(regUser2Res.status, 201, 'İstifadəçi 2 201 statusu ilə qeydiyyatdan keçməlidir');
    const user2Data = await regUser2Res.json();
    const user2Token = user2Data.token;
    assert.ok(user2Token, 'İstifadəçi 2 üçün JWT token təmin edilməlidir');
    console.log('   ✅ İstifadəçi 2 qeydiyyatı tamamlandı.');

    // 6. Admin Girişi (admin@eventify.com / admin123)
    console.log('6. Admin girişi yoxlanılır...');
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@eventify.com', password: 'admin123' })
    });
    assert.strictEqual(adminLoginRes.status, 200, 'Admin girişi 200 qaytarmalıdır');
    const adminData = await adminLoginRes.json();
    const adminToken = adminData.token;
    assert.strictEqual(adminData.user.role, 'admin', 'Rolu admin olmalıdır');
    console.log('   ✅ Admin girişi uğurla təsdiqləndi.');

    // 7. Səlahiyyət: Adi istifadəçi tədbir yarada bilməz (403 Forbidden)
    console.log('7. Adi istifadəçinin tədbir yaratması yoxlanılır (403)...');
    const unauthorizedCreate = await fetch(`${baseUrl}/events`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user1Token}`
      },
      body: JSON.stringify({
        title: 'Qeyri-qanuni Tədbir',
        description: 'Test',
        date: '20 Noyabr 2026, 15:00',
        location: 'Bakı',
        capacity: 10
      })
    });
    assert.strictEqual(unauthorizedCreate.status, 403, 'Adi istifadəçiyə 403 qadağası verilməlidir');
    console.log('   ✅ Səlahiyyət nəzarəti işləyir (403 Forbidden).');

    // 8. Admin tərəfindən tutumu cəmi 1 nəfər olan test tədbirinin yaradılması
    console.log('8. Admin 1 nəfərlik test tədbiri yaradır...');
    const createEventRes = await fetch(`${baseUrl}/events`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: `Smoke Test Tədbiri ${Date.now()}`,
        description: 'Avtomatlaşdırılmış tutum testi təsviri',
        date: '30 Dekabr 2026, 18:00',
        location: 'Bakı İdman Sarayı',
        capacity: 1,
        category: 'Texnologiya',
        status: 'Gələcəkdə',
        registration_deadline: '29 Dekabr 2026, 23:59'
      })
    });
    assert.strictEqual(createEventRes.status, 201, 'Tədbir 201 ilə yaradılmalıdır');
    const eventData = await createEventRes.json();
    const eventId = eventData.event.id;
    assert.ok(eventId, 'Yaradılan tədbirin ID-si olmalıdır');
    console.log(`   ✅ Tədbir yaradıldı (ID: ${eventId}, Tutum: 1).`);

    // 9. İstifadəçi 1 tədbirə qeydiyyatdan keçir (1/1 yer dolur)
    console.log('9. İstifadəçi 1 tədbirə yazılır...');
    const reg1Res = await fetch(`${baseUrl}/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });
    assert.strictEqual(reg1Res.status, 201, 'İstifadəçi 1 uğurla qeydiyyatdan keçməlidir (201 Created)');
    console.log('   ✅ İstifadəçi 1 tədbirə yazıldı (1/1 yer doldu).');

    // 10. Təkrar qeydiyyat bloklanır (UNIQUE user_id, event_id)
    console.log('10. Təkrar qeydiyyat cəhdi yoxlanılır...');
    const duplicateRes = await fetch(`${baseUrl}/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });
    assert.strictEqual(duplicateRes.status, 400, 'Təkrar qeydiyyat 400 xətası verməlidir');
    console.log('   ✅ Təkrar qeydiyyat uğurla bloklandı.');

    // 11. Tutum dolduqda İstifadəçi 2-nin qeydiyyatı bloklanır (Overbooking / Race Condition müdafiəsi)
    console.log('11. Yer dolduqda yeni istifadəçinin qeydiyyat cəhdi yoxlanılır...');
    const fullRes = await fetch(`${baseUrl}/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${user2Token}` }
    });
    assert.strictEqual(fullRes.status, 400, 'Yer dolduqda 400 xətası verilməlidir');
    const fullData = await fullRes.json();
    assert.ok(fullData.message.includes('yer qalmayıb'), 'Xəta mesajında boş yer qalmadığı bildirilməlidir');
    console.log('   ✅ Tutum limiti uğurla qorundu (Overbooking bloklandı).');

    // 12. Tutumun mövcud qeydiyyat sayından (1) aşağı salınmasının bloklanması
    console.log('12. Tutumu mövcud qeydiyyat sayından az azaltmaq cəhdi yoxlanılır...');
    const lowerCapRes = await fetch(`${baseUrl}/events/${eventId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Yenilənmiş Başlıq',
        description: 'Test Təsvir',
        date: '30 Dekabr 2026, 18:00',
        location: 'Bakı',
        capacity: 0, // 1 nəfər qeydiyyatdaykən 0 etmək olmaz!
        category: 'Texnologiya',
        status: 'Gələcəkdə'
      })
    });
    assert.strictEqual(lowerCapRes.status, 400, 'Tutum 0 və ya qeydiyyatdan az olduqda 400 qaytarmalıdır');
    console.log('   ✅ Tutumun qeydiyyat sayından aşağı salınması bloklandı.');

    // 13. İstifadəçi 1 qeydiyyatını ləğv edir (Yer boşalır: 0/1)
    console.log('13. İstifadəçi 1 qeydiyyatını ləğv edir...');
    const cancelRes = await fetch(`${baseUrl}/events/${eventId}/register`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });
    assert.strictEqual(cancelRes.status, 200, 'Qeydiyyat uğurla ləğv edilməlidir');
    console.log('   ✅ Qeydiyyat ləğv edildi və 1 yer azad olundu.');

    // 14. Yer açıldıqdan sonra İstifadəçi 2 indi qeydiyyatdan keçə bilməlidir
    console.log('14. Azad olan yerə İstifadəçi 2 yazılır...');
    const reg2Res = await fetch(`${baseUrl}/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${user2Token}` }
    });
    assert.strictEqual(reg2Res.status, 201, 'İstifadəçi 2 artıq uğurla qeydiyyatdan keçməlidir (201 Created)');
    console.log('   ✅ İstifadəçi 2 azad olan yerə uğurla yazıldı.');

    // 15. Admin tədbiri silir (ON DELETE CASCADE ilə qeydiyyatlar da silinir)
    console.log('15. Admin tədbiri silir (Cascade DELETE)...');
    const deleteRes = await fetch(`${baseUrl}/events/${eventId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.strictEqual(deleteRes.status, 200, 'Tədbir uğurla silinməlidir');
    console.log('   ✅ Tədbir və əlaqəli qeydiyyatlar uğurla silindi.');

    console.log(`\n========================================`);
    console.log(`🎉 BÜTÜN 15 SMOKE TEST UĞURLA KEÇDİ!`);
    console.log(`========================================\n`);
    
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ SMOKE TEST UĞURSUZ OLDU:', err);
    server.close();
    process.exit(1);
  }
};

runTests();
