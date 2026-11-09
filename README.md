# Eventify — Tədbir İdarəetmə Sistemi

Diplom layihəsi üçün hazırlanmış müasir və tam funksional tədbir idarəetmə veb platforması.

---

## 🛠 Texnoloji Stack

### Frontend:
* **Kitabxana:** React 19 + TypeScript
* **Qurucu:** Vite
* **Stilləndirmə:** Tailwind CSS (Fərdi qəhvəyi/krem palitrası)
* **Qlobal State & API Sorğuları:** Redux Toolkit & RTK Query
* **Naviqasiya:** React Router DOM v7
* **İkonlar:** Lucide React

### Backend:
* **Server Mühiti:** Node.js + Express.js (ES Modules)
* **Verilənlər Bazası:** SQLite3 (Lokal fayl əsaslı, əlavə server sazlaması tələb etmir)
* **Autentifikasiya:** JSON Web Token (JWT)
* **Şifrələmə:** bcryptjs (Şifrələrin təhlükəsiz hash-lənməsi)

---

## 🎨 Dizayn Palitrası

* **Tünd qəhvəyi (`#3B2418`):** Əsas rəng (başlıqlar və əsas düymələr)
* **Karamel (`#795548`):** İkinci dərəcəli rəng (təsvirlər və köməkçi mətnlər)
* **İsti bej (`#C49A6C`):** Vurğu rəngi (loqo və status nişanları)
* **Krem (`#F5EFE6`):** Arxa fon
* **Ağ (`#FFFFFF`):** Kartlar və modallar

---

## 🚀 Layihənin Quraşdırılması və İşə Salınması

### 1. Repozitoriyanı klonlayın:
```bash
git clone https://github.com/XelilovTh/Eventify.git
cd Eventify
```

### 2. Backend-i işə salın:
```bash
cd server
npm install
npm run dev
```
*Backend `http://localhost:5000` ünvanında işə düşəcək.*

### 3. Frontend-i işə salın (Ayrı terminalda):
```bash
cd client
npm install
npm run dev
```
*Frontend `http://localhost:5173` ünvanında açılacaq.*

---

## 🔐 Standart İstifadəçi Hesabları

* **Admin Hesabı:**
  * E-poçt: `admin@eventify.com`
  * Şifrə: `admin123`
  *(Bütün tədbirləri yaratmaq, redaktə etmək, silmək və qeydiyyatçıları idarə etmək hüququ var)*

* **Adi İstifadəçi:**
  * Saytın "Qeydiyyat" səhifəsindən istənilən ad və e-poçtla yeni hesab yarada bilərsiniz.

---

## 📋 Əsas Funksionallıqlar

1. **İstifadəçi Autentifikasiyası:** Qeydiyyat, Giriş və JWT token əsaslı sessiya idarəsi.
2. **Tədbirlər Siyahısı və Detalları:** Real vaxt rejimində boş yerlərin sayının hesablanması.
3. **Qeydiyyat Qaydaları (Biznes Məntiqi):**
   * Tutum (capacity) dolduqda qeydiyyat avtomatik bağlanır.
   * Eyni istifadəçi bir tədbirə iki dəfə yazıla bilməz (SQLite `UNIQUE` məhdudiyyəti).
   * İstifadəçi istədiyi an qeydiyyatını ləğv edə bilər.
4. **Admin Dashboard:**
   * Cəmi tədbir, istifadəçi və qeydiyyat sayının statistikası.
   * Tədbirlər üzrə tam CRUD (Yarat / Oxu / Yenilə / Sil).
   * Hər tədbirə yazılan şəxslərin siyahısına baxış və istənilən qeydiyyatçını silmək imkanı.
   * İstifadəçilərin idarəsi və silinməsi.
