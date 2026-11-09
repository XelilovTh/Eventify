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

  console.log(`[TEST] Smoke testlər başladıldı (Port: ${port})`);

  try {
    // 1. Health Check
    const healthRes = await fetch(`${baseUrl}/health`);
    assert.strictEqual(healthRes.status, 200);
    console.log('[OK] 1. Health check');

    // 2. Register: səhv e-poçt
    const badEmailRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'not-an-email', password: 'password123' })
    });
    assert.strictEqual(badEmailRes.status, 400);
    console.log('[OK] 2. E-poçt format yoxlanışı');

    // 3. Register: qısa şifrə (< 6 simvol)
    const shortPassRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'valid@example.com', password: '123' })
    });
    assert.strictEqual(shortPassRes.status, 400);
    console.log('[OK] 3. Şifrə uzunluq yoxlanışı');

    // 4. Qeydiyyat: İstifadəçi 1 və İstifadəçi 2
    const user1Email = `user1_${Date.now()}@example.com`;
    const user2Email = `user2_${Date.now()}@example.com`;

    const regUser1Res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'İstifadəçi 1', email: user1Email, password: 'password123' })
    });
    assert.strictEqual(regUser1Res.status, 201);
    const user1Data = await regUser1Res.json();
    const user1Token = user1Data.token;
    assert.ok(user1Token);
    console.log('[OK] 4. İstifadəçi 1 qeydiyyatı');

    const regUser2Res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'İstifadəçi 2', email: user2Email, password: 'password123' })
    });
    assert.strictEqual(regUser2Res.status, 201);
    const user2Data = await regUser2Res.json();
    const user2Token = user2Data.token;
    assert.ok(user2Token);
    console.log('[OK] 5. İstifadəçi 2 qeydiyyatı');

    // 6. Admin girişi
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@eventify.com', password: 'admin123' })
    });
    assert.strictEqual(adminLoginRes.status, 200);
    const adminData = await adminLoginRes.json();
    const adminToken = adminData.token;
    assert.strictEqual(adminData.user.role, 'admin');
    console.log('[OK] 6. Admin girişi');

    // 7. Səlahiyyət yoxlanışı
    const unauthorizedCreate = await fetch(`${baseUrl}/events`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user1Token}`
      },
      body: JSON.stringify({
        title: 'Test',
        description: 'Test',
        date: '20 Noyabr 2026, 15:00',
        location: 'Bakı',
        capacity: 10
      })
    });
    assert.strictEqual(unauthorizedCreate.status, 403);
    console.log('[OK] 7. Səlahiyyət nəzarəti (403)');

    // 8. Tədbir yaratma
    const createEventRes = await fetch(`${baseUrl}/events`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: `Test Tədbiri ${Date.now()}`,
        description: 'Təsvir',
        date: '30 Dekabr 2026, 18:00',
        location: 'Bakı',
        capacity: 1,
        category: 'Texnologiya',
        status: 'Gələcəkdə',
        registration_deadline: '29 Dekabr 2026, 23:59'
      })
    });
    assert.strictEqual(createEventRes.status, 201);
    const eventData = await createEventRes.json();
    const eventId = eventData.event.id;
    assert.ok(eventId);
    console.log(`[OK] 8. Tədbir yaradıldı (ID: ${eventId})`);

    // 9. Qeydiyyat
    const reg1Res = await fetch(`${baseUrl}/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });
    assert.strictEqual(reg1Res.status, 201);
    console.log('[OK] 9. Tədbirə qeydiyyat');

    // 10. Təkrar qeydiyyat
    const duplicateRes = await fetch(`${baseUrl}/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });
    assert.strictEqual(duplicateRes.status, 400);
    console.log('[OK] 10. Təkrar qeydiyyatın bloklanması');

    // 11. Tutum limiti
    const fullRes = await fetch(`${baseUrl}/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${user2Token}` }
    });
    assert.strictEqual(fullRes.status, 400);
    const fullData = await fullRes.json();
    assert.ok(fullData.message.includes('yer qalmayıb'));
    console.log('[OK] 11. Tutum limitinin yoxlanışı');

    // 12. Tutumu mövcud qeydiyyat sayından az azaltmaq cəhdi
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
        capacity: 0,
        category: 'Texnologiya',
        status: 'Gələcəkdə'
      })
    });
    assert.strictEqual(lowerCapRes.status, 400);
    console.log('[OK] 12. Tutum azaldılmasının qarşısının alınması');

    // 13. Qeydiyyatın ləğvi
    const cancelRes = await fetch(`${baseUrl}/events/${eventId}/register`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });
    assert.strictEqual(cancelRes.status, 200);
    console.log('[OK] 13. Qeydiyyatın ləğv edilməsi');

    // 14. Yer açıldıqdan sonra qeydiyyat
    const reg2Res = await fetch(`${baseUrl}/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${user2Token}` }
    });
    assert.strictEqual(reg2Res.status, 201);
    console.log('[OK] 14. Yeni istifadəçinin qeydiyyatı');

    // 15. Tədbirin silinməsi
    const deleteRes = await fetch(`${baseUrl}/events/${eventId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.strictEqual(deleteRes.status, 200);
    console.log('[OK] 15. Tədbirin silinməsi (Cascade)');

    console.log('[OK] Bütün 15 test uğurla keçdi.');
    
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('[FAIL] Test xətası:', err);
    server.close();
    process.exit(1);
  }
};

runTests();
