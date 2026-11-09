# Eventify — Tədbir İdarəetmə Sistemi

Tədbirlərin təşkili, idarə edilməsi və istifadəçilərin qeydiyyatı üçün veb tətbiqi. Diplom layihəsi çərçivəsində hazırlanıb.

---

## Texnologiyalar

### Frontend
- React 19 və TypeScript (Vite ilə yığılıb)
- Tailwind CSS
- Redux Toolkit və RTK Query (vəziyyət idarəsi və API sorğuları)
- React Router DOM v7
- Lucide React ikonları

### Backend
- Node.js və Express (ES Modules)
- SQLite3 (əlavə konfiqurasiya tələb etməyən lokal verilənlər bazası)
- JSON Web Token (JWT) və bcryptjs

---

## Dizayn və İnterfeys

İnterfeys qəhvəyi və bej tonlarında hazırlanıb. Əsas elementlər üçün tünd qəhvəyi (#3B2418), vurğular üçün isti bej (#C49A6C) və fon üçün açıq krem (#F5EFE6) rənglərindən istifadə edilib.

---

## Quraşdırma və İşə Salma

### 1. Repozitoriyanı yükləyin:
```bash
git clone https://github.com/XelilovTh/Eventify.git
cd Eventify
```

### 2. Backend serverini işə salın:
```bash
cd server
npm install
npm run seed   # ilkin tədbir məlumatlarını bazaya yazmaq üçün
npm run dev
```
Server `http://localhost:5000` ünvanında işləyir.

### 3. Frontend-i işə salın (ayrı terminalda):
```bash
cd client
npm install
npm run dev
```
Tətbiq brauzerdə `http://localhost:5173` ünvanında açılır.

---

## Standart İstifadəçi Hesabları

- **Admin hesabı:**
  - E-poçt: `admin@eventify.com`
  - Şifrə: `admin123`
  *(Tədbirlərin yaradılması, redaktəsi, silinməsi və iştirakçıların idarəsi)*

- **İstifadəçi hesabı:**
  - Qeydiyyat səhifəsindən istənilən e-poçtla yeni hesab yaradıla bilər.

---

## Funksiyalar

1. **Autentifikasiya:** Qeydiyyat, giriş və JWT əsaslı sessiya idarəsi.
2. **Tədbirlər:** Tarix və kateqoriya üzrə axtarış, filtr və çeşidləmə.
3. **Qeydiyyat sistemi:**
   - Tutum limiti yoxlanışı (yer dolduqda qeydiyyat bloklanır).
   - Təkrar qeydiyyatın qarşısının alınması.
   - İstifadəçinin öz qeydiyyatını istədiyi vaxt ləğv etməsi.
4. **Admin paneli:**
   - Ümumi statistika (tədbir, istifadəçi və qeydiyyat sayı).
   - Tədbirlərin tam CRUD idarəetməsi.
   - İştirakçı siyahısına baxış və qeydiyyatın silinməsi.
   - İstifadəçi hesablarının idarə olunması.
