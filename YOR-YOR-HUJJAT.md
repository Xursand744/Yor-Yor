# Yor Yor — to‘liq loyiha hujjati

**Loyiha nomi (brend):** Yor Yor  
**Paket nomi:** `toy24`  
**Maqsad:** to‘yxonalarni onlayn ko‘rish, kun/slot bo‘yicha bron qilish, admin tasdiqlashi va to‘lov holatini kuzatish (MVP).  
**Asosiy ishlatish:** veb-sayt (`npm run dev` / production server). APK ixtiyoriy (loyihada Capacitor qoldirilgan, lekin sizga kerak emas).

---

## Mundarija

1. [Texnologiyalar](#1-texnologiyalar)
2. [Loyiha tuzilmasi](#2-loyiha-tuzilmasi)
3. [Birinchi marta o‘rnatish](#3-birinchi-marta-ornatish)
4. [Muhit o‘zgaruvchilari (.env)](#4-muhit-ozgaruvchilari-env)
5. [Ma’lumotlar bazasi](#5-malumotlar-bazasi)
6. [Ishga tushirish](#6-ishga-tushirish)
7. [Foydalanuvchi rollari va sahifalar](#7-foydalanuvchi-rollari-va-sahifalar)
8. [Kirish, ro‘yxatdan o‘tish, parol](#8-kirish-roʻyxatdan-otish-parol)
9. [Bron biznes-logikasi](#9-bron-biznes-logikasi)
10. [API ro‘yxati](#10-api-royxati)
11. [Komponentlar va UI](#11-komponentlar-va-ui)
12. [npm skriptlar](#12-npm-skriptlar)
13. [Xavfsizlik](#13-xavfsizlik)
14. [Production checklist](#14-production-checklist)
15. [Muammolar va yechimlar](#15-muammolar-va-yechimlar)
16. [Ixtiyoriy: APK / static export](#16-ixtiyoriy-apk--static-export)
17. [Bajarilgan ishlar (qisqa)](#17-bajarilgan-ishlar-qisqa)

---

## 1. Texnologiyalar

| Qatlam | Texnologiya |
|--------|-------------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Stil | Tailwind CSS 3 |
| Animatsiya | GSAP + `@gsap/react` |
| Ikonkalar | `lucide-react` |
| Auth | NextAuth.js 4 (Credentials + JWT sessiya) |
| ORM | Prisma 5 |
| DB (dev) | SQLite (`prisma/dev.db`) |
| DB (prod tavsiya) | PostgreSQL |
| Validatsiya | Zod |
| Parol | bcrypt |

---

## 2. Loyiha tuzilmasi

```
To'yhona/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Bosh sahifa (Yor Yor landing)
│   ├── layout.tsx                # Root layout + Providers
│   ├── login/                    # Kirish + ForgotPasswordPanel
│   ├── royxatdan-otish/          # RegisterWizard
│   ├── mijoz/                    # Mijoz interfeysi
│   │   ├── page.tsx              # To‘yxonalar ro‘yxati
│   │   ├── [venueId]/page.tsx    # Bron wizard
│   │   └── muvaffaqiyat/         # Bron muvaffaqiyat sahifasi
│   ├── admin/                    # Tadbirkor / admin panel
│   ├── boshqaruv/                # → /admin redirect
│   └── api/                      # REST API (Route Handlers)
├── components/
│   ├── Navbar.tsx
│   ├── home/LandingPage.tsx
│   ├── auth/AuthChrome.tsx, RegisterWizard.tsx
│   ├── mijoz/VenueBookingWizard.tsx, MuvaffaqiyatView.tsx, SuccessActions.tsx
│   └── admin/AdminPanel.tsx, AdminShell.tsx, ManageBookingsPanel.tsx
├── lib/
│   ├── auth.ts                   # NextAuth sozlamalari
│   ├── auth-redirect.ts          # Rol bo‘yicha yo‘naltirish
│   ├── prisma.ts
│   ├── format.ts                 # formatUzs, calcAdvanceAmount
│   ├── phone.ts                  # normalizeUzPhone, fullName
│   ├── api-url.ts                # apiUrl() — ixtiyoriy tashqi API
│   ├── api-error.ts, api-response.ts
│   ├── calendar-display.ts
│   ├── date.ts
│   ├── services/                 # venue, booking, register, slot
│   └── validations/              # auth, booking, venue
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                   # To‘yxonalar + admin/manager
├── types/                        # next-auth.d.ts, booking, venue
├── middleware.ts                 # /admin himoyasi
├── next.config.mjs
├── tailwind.config.ts
├── .env.example
├── LOYIHA-ISHLARI.md             # Ishlar jurnalı
└── YOR-YOR-HUJJAT.md             # Ushbu hujjat
```

---

## 3. Birinchi marta o‘rnatish

### Talablar

- Node.js 18+ (20 tavsiya etiladi)
- npm

### Qadamlar

```bash
# 1. Loyiha papkasiga kiring
cd "To'yhona"

# 2. Bog‘liqliklar
npm install

# 3. Muhit fayli
copy .env.example .env
# Linux/macOS: cp .env.example .env

# 4. Prisma client
npm run db:generate

# 5. Bazani yaratish (bittasini tanlang)

# Variant A — migratsiya (tavsiya)
npx prisma migrate dev --name init

# Variant B — tezkor prototip
npm run db:push

# 6. Seed (to‘yxonalar, slotlar, test foydalanuvchilar)
npm run db:seed

# 7. Ishga tushirish
npm run dev
```

Brauzer: **http://localhost:3000**

---

## 4. Muhit o‘zgaruvchilari (.env)

| O‘zgaruvchi | Majburiy | Tavsif |
|-------------|----------|--------|
| `DATABASE_URL` | Ha | SQLite: `file:./prisma/dev.db` yoki PostgreSQL URL |
| `NEXTAUTH_URL` | Ha | Ilova manzili, masalan `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Ha | JWT shifrlash (kamida ~32 belgi, random) |

**Veb uchun yetarli** — quyidagilar shart emas:

| O‘zgaruvchi | Qachon kerak |
|-------------|--------------|
| `NEXT_PUBLIC_API_URL` | Faqat APK/static frontend alohida serverga ulanganda |
| `NEXT_PUBLIC_NEXTAUTH_URL` | Xuddi shu holatda |

`.env` faylini gitga **commit qilmang** (`.gitignore` da).

---

## 5. Ma’lumotlar bazasi

### Modellar (qisqa)

| Model | Vazifasi |
|-------|----------|
| `Venue` | To‘yxona (narx, sig‘im, manzil, avans %) |
| `User` | Foydalanuvchi (`role`, `phone`, `venueId`) |
| `EventSlot` | Vaqt turlari (`abetki_toy`, `kechki_toy`) |
| `Booking` | Bron (`pending` / `confirmed` / `cancelled`) |
| `Payment` | To‘lov yozuvlari |
| `VenueImage` | To‘yxona rasmlari (URL) |
| `VenueReview` | Mijoz sharhlari |
| `Account`, `Session` | NextAuth adapter |

### Vaqt slotlari (seed)

- `abetki_toy` — abetki to‘y
- `kechki_toy` — kechki to‘y

(Eski nomlar `nahor_oshi`, `kechki_bazm` UI da ham qo‘llab-quvvatlanadi.)

### Seed to‘yxonalar (8 ta)

Oltin Saroy, Billur, Fayz, Tantana, Odilbek, Istanbul, Decarat, Marvarid — Toshkent manzillari, `basePrice` va `advancePercent` bilan.

### Test foydalanuvchilar (`npm run db:seed`)

| Rol | Email | Telefon | Parol | Izoh |
|-----|-------|---------|-------|------|
| `admin` | admin@toy24.uz | +998900000001 | `Admin123!` | Barcha venue lar bo‘yicha keng huquq |
| `manager` | manager@toy24.uz | +998900000002 | `Manager123!` | **Oltin Saroy** bilan bog‘langan |

**Mijoz** — `/royxatdan-otish` orqali `client` sifatida ro‘yxatdan o‘tadi.

### Foydali DB buyruqlar

```bash
npm run db:studio      # Prisma Studio (vizual DB)
npm run db:migrate     # Yangi migratsiya
npm run db:push        # Schema → DB (dev)
npm run db:seed        # Seed qayta ishlatish
```

---

## 6. Ishga tushirish

### Ishlab chiqish

```bash
npm run dev
```

- Hot reload yoqilgan
- API va sahifalar bir serverda

### Production build

```bash
npm run build
npm start
```

Productionda `.env` da:

- `NEXTAUTH_URL=https://sizning-domen.uz`
- `DATABASE_URL` — PostgreSQL (tavsiya)
- `NEXTAUTH_SECRET` — kuchli yangi secret

### Lint

```bash
npm run lint
```

---

## 7. Foydalanuvchi rollari va sahifalar

### Rollar

| `role` | Kim | Asosiy yo‘nalish |
|--------|-----|------------------|
| `client` | Mijoz (to‘y egasi) | `/mijoz` |
| `manager` | To‘yxona egasi / tadbirkor | `/admin` |
| `admin` | Super admin | `/admin` |

Mantiq: `lib/auth-redirect.ts` — `resolvePostAuthRedirect()`, `getDefaultPathForRole()`.

### Sahifalar (URL)

| URL | Kim uchun | Tavsif |
|-----|-----------|--------|
| `/` | Hammaga | Yor Yor landing — qidiruv, to‘yxona kartochkalari |
| `/login` | Hammaga | Kirish (ism, familiya, telefon, parol) |
| `/royxatdan-otish` | Yangi user | Mijoz yoki tadbirkor (+ to‘yxona) ro‘yxati |
| `/mijoz` | Mijoz | To‘yxonalar ro‘yxati |
| `/mijoz/[venueId]` | Mijoz | Kalendar, slot, bron, sharh |
| `/mijoz/muvaffaqiyat?bookingId=...` | Mijoz | Bron natijasi / to‘lov qoldig‘i |
| `/admin` | manager, admin | Kalendar, bronlar, venue tahriri, rasmlar |
| `/boshqaruv` | — | `/admin` ga redirect |

### Middleware

`middleware.ts` — faqat `/admin/*` uchun NextAuth `withAuth`; login bo‘lmasa → `/login`.

`/mijoz` ochiq (bron uchun login shart emas, lekin ba’zi API lar sessiyasiz ham ishlaydi).

---

## 8. Kirish, ro‘yxatdan o‘tish, parol

### Kirish (`/login`)

- **Credentials** provider: telefon + parol (`bcrypt` tekshiruvi)
- Qo‘shimcha: ism + telefon (parolsiz legacy usul — faqat ism mos kelsa; yangi userlar parol bilan)
- **Parolni unutdingizmi?** — modal `ForgotPasswordPanel` → `POST /api/auth/reset-password`
- Muvaffaqiyatdan keyin `signIn` → rol bo‘yicha redirect

### Ro‘yxatdan o‘tish (`/royxatdan-otish`)

| Tur | `accountType` | Natija |
|-----|---------------|--------|
| Mijoz | `client` | User `role: client` |
| Tadbirkor | `owner` | User `role: manager` + yangi `Venue` |

- Zod: `registerSchema` (`discriminatedUnion`)
- API: `POST /api/auth/register`
- Muvaffaqiyat: avtomatik `signIn` + redirect

### Telefon formati

`+998XXXXXXXXX` (9 raqam) — `lib/phone.ts` → `normalizeUzPhone()`.

### Sessiya

- Strategiya: **JWT** (30 kun)
- Sessiyada: `id`, `role`, `venueId`, `phone`
- Turlar: `types/next-auth.d.ts`

---

## 9. Bron biznes-logikasi

### Statuslar

| `status` | Ma’nosi |
|----------|---------|
| `pending` | Mijoz ariza yubordi, admin tasdiqlashi kutilmoqda |
| `confirmed` | Admin tasdiqladi |
| `cancelled` | Bekor qilindi |

### To‘lov holati (`paymentStatus`)

| Qiymat | Ma’nosi |
|--------|---------|
| `unpaid` | To‘lanmagan |
| `advance_paid` | Avans to‘langan |
| `paid` | To‘liq to‘langan |

### Mijoz oqimi

1. `/mijoz` — to‘yxona tanlash  
2. `/mijoz/[venueId]` — `VenueBookingWizard`:  
   - Oylik kalendar (`GET /api/venues/[id]/calendar`)  
   - Slotlar (`GET /api/slots`)  
   - Kun/slot tanlash → mijoz ism/telefon → `POST /api/bookings`  
3. `/mijoz/muvaffaqiyat?bookingId=...` — natija, qolgan to‘lov (`POST .../pay`)

### Admin oqimi

1. `/admin` — `AdminPanel`  
2. Kalendar: band/bo‘sh kunlar  
3. `ManageBookingsPanel` — kutilayotgan bronlar:  
   - `PATCH /api/bookings/[id]/confirm`  
   - `PATCH /api/bookings/[id]/cancel`  
4. Venue ma’lumotlari, rasmlar (URL), yangi bron qo‘shish

### Double booking himoyasi

Bir xil `venueId` + `bookingDate` + `slotId` uchun faol (`pending`/`confirmed`) bron bo‘lsa — yangi bron `400` + `SLOT_NOT_AVAILABLE`.

### Summa hisobi

- `totalAmount` — venue `basePrice` asosida  
- `advancePercent` — venue dan (default 30%)  
- `formatUzs()` — barqaror ko‘rinish (hydration xatosiz)

---

## 10. API ro‘yxati

Baza: `http://localhost:3000` (yoki production domen).

### Auth

| Metod | Yo‘l | Auth | Tavsif |
|-------|------|------|--------|
| * | `/api/auth/[...nextauth]` | — | NextAuth (signIn, session, signOut) |
| POST | `/api/auth/register` | — | Ro‘yxatdan o‘tish |
| POST | `/api/auth/reset-password` | — | Telefon + yangi parol |

### To‘yxonalar

| Metod | Yo‘l | Auth | Tavsif |
|-------|------|------|--------|
| GET | `/api/venues` | — | Barcha to‘yxonalar (reyting bilan) |
| POST | `/api/venues` | — | Yangi venue (validatsiya) |
| GET | `/api/venues/[id]` | — | Bitta venue |
| PATCH | `/api/venues/[id]` | Session | Venue yangilash |
| GET | `/api/venues/[id]/calendar` | — | `?year=&month=` yoki `from`/`to` |
| GET | `/api/venues/[id]/images` | — | Rasmlar ro‘yxati |
| POST | `/api/venues/[id]/images` | Session | Rasm URL qo‘shish |
| DELETE | `/api/venues/[id]/images/[imageId]` | Session | Rasm o‘chirish |
| GET | `/api/venues/[id]/reviews` | — | Sharhlar |
| POST | `/api/venues/[id]/reviews` | — | Sharh qoldirish |

### Slotlar va bronlar

| Metod | Yo‘l | Auth | Tavsif |
|-------|------|------|--------|
| GET | `/api/slots` | — | `abetki_toy`, `kechki_toy` |
| GET | `/api/bookings` | Session | `?venueId=` — admin/manager bronlar |
| POST | `/api/bookings` | — | Yangi bron yaratish |
| GET | `/api/bookings/[id]` | — | Bron tafsiloti |
| GET | `/api/bookings/pending` | Session | Kutilayotgan bronlar |
| PATCH | `/api/bookings/[id]/confirm` | Session (staff) | Tasdiqlash |
| PATCH | `/api/bookings/[id]/cancel` | Session (staff) | Bekor qilish |
| POST | `/api/bookings/[id]/pay` | — | Qolgan to‘lov (mock `online`) |

### POST `/api/bookings` namuna

```json
{
  "venueId": "clxxx...",
  "bookingDate": "2026-06-15",
  "slotId": "clxxx...",
  "clientName": "Ali Valiyev",
  "clientPhone": "+998901234567",
  "status": "pending",
  "paymentPlan": "advance"
}
```

### GET `/api/venues/[id]/calendar` namuna

```
GET /api/venues/{id}/calendar?year=2026&month=6
```

Javob: `days[]` — har bir kunda `slots[]` (band/bo‘sh holat UI uchun).

---

## 11. Komponentlar va UI

### Brend

- **Yor Yor** — bosh sahifa, metadata (`app/layout.tsx`)
- Ranglar: binafsha / fuchsia (`tailwind` → `yoryor.*`)
- Mijoz qismi: iliq krem fon (`#faf6f0`)
- Admin / login: to‘q yashil-ko‘k tonlar (`toy.*`)

### Asosiy komponentlar

| Komponent | Vazifa |
|-----------|--------|
| `Navbar` | GSAP, session, kirish/chiqish |
| `LandingPage` | Hero, qidiruv, venue kartochkalar |
| `LoginForm` | Kirish formasi |
| `ForgotPasswordPanel` | Parol tiklash modali |
| `RegisterWizard` | Ko‘p qadamli ro‘yxat |
| `VenueBookingWizard` | Mijoz bron oqimi |
| `MuvaffaqiyatView` | Bron natijasi (client fetch) |
| `AdminPanel` | Kalendar, venue, rasmlar, bron |
| `ManageBookingsPanel` | Tasdiqlash / bekor qilish |
| `AuthChrome` | Login/register atrofi dizayn |
| `Providers` | `SessionProvider` (NextAuth) |

### Animatsiya (GSAP)

Login/register animatsiyalarida `revertOnUpdate: false` — inputlarga yozish bloklanmasin.

### Narx formati

`lib/format.ts` → `formatUzs()` — server va clientda bir xil (`52 000 000`).

---

## 12. npm skriptlar

| Skript | Vazifa |
|--------|--------|
| `npm run dev` | Ishlab chiqish serveri |
| `npm run build` | Production build (API bilan) |
| `npm start` | Production server |
| `npm run lint` | ESLint |
| `npm run db:generate` | `prisma generate` |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:push` | `prisma db push` |
| `npm run db:seed` | Seed |
| `npm run db:studio` | Prisma Studio |
| `npm run static` | Ixtiyoriy static export (APK uchun) |
| `npm run cap:sync` | Ixtiyoriy Capacitor sync |
| `npm run cap:android` | Ixtiyoriy Android Studio |

**Kundalik veb ishi:** faqat `dev` / `build` + `start`.

---

## 13. Xavfsizlik

- Parollar `bcrypt` (10 round) hash
- JWT `NEXTAUTH_SECRET` bilan imzolanadi
- `/admin` — middleware orqali himoyalangan
- Manager faqat o‘z `venueId` bronlarini ko‘radi (API da filter)
- Admin barcha venue larni ko‘radi
- API xatolari: `lib/api-response.ts`, `lib/api-error.ts` (client uchun tushunarli xabar)

**Productionda:**

- `NEXTAUTH_SECRET` ni almashtiring
- HTTPS majburiy
- PostgreSQL + muntazam backup
- Seed parollarini o‘zgartiring yoki o‘chiring

---

## 14. Production checklist

- [ ] `.env` production qiymatlari
- [ ] `DATABASE_URL` → PostgreSQL
- [ ] `npx prisma migrate deploy`
- [ ] `npm run build` muvaffaqiyatli
- [ ] `NEXTAUTH_URL` = haqiqiy domen
- [ ] Reverse proxy (Nginx) + SSL
- [ ] `npm start` yoki PM2/systemd
- [ ] Seed test parollarini yangilash / olib tashlash
- [ ] Firewall, faqat kerakli portlar

---

## 15. Muammolar va yechimlar

| Muammo | Sabab | Yechim |
|--------|-------|--------|
| Login inputga yozilmaydi | GSAP | `revertOnUpdate: false` (tuzatilgan) |
| Narx hydration xatosi | Locale farqi | `formatUzs()` |
| Ro‘yxatdan “Tarmoq xatosi” | API 500 / Zod | Schema va `api-error` tuzatilgan |
| `/admin` ochilmaydi | Sessiya yo‘q | `/login` dan manager/admin bilan kirish |
| Bron “band” | Slot band | Boshqa kun/slot tanlang |
| Eski user kira olmaydi | Parol yo‘q | **Parolni tiklash** |
| `prisma/dev.db` yo‘q | Seed qilinmagan | `db:push` + `db:seed` |
| Build TypeScript xato | `role` turi | `user.role as UserRoleValue` (tuzatilgan) |

---

## 16. Ixtiyoriy: APK / static export

Siz **APK ishlatmayapsiz** — bu bo‘lim faqat kelajak uchun.

- `npm run static` — `scripts/static-export.mjs` API ni vaqtincha olib tashlab `out/` yaratadi
- `BUILD_STATIC=1` — `next.config.mjs` da `output: "export"`
- Capacitor: `capacitor.config.ts`, `android/` papka
- Tashqi API: `NEXT_PUBLIC_API_URL` + `lib/api-url.ts`

Veb rejimda bularni **ishlatish shart emas**.

---

## 17. Bajarilgan ishlar (qisqa)

| Bo‘lim | Holat |
|--------|--------|
| Yor Yor brend + landing + Navbar | ✅ |
| Login + parol + parol tiklash | ✅ |
| Ro‘yxatdan o‘tish (mijoz / tadbirkor) | ✅ |
| Mijoz bron wizard + muvaffaqiyat | ✅ |
| Admin panel + bron tasdiqlash | ✅ |
| Kalendar, double booking | ✅ |
| SQLite seed (8 venue, 2 slot) | ✅ |
| Texnik tuzatishlar (GSAP, format, Zod, ESLint) | ✅ |
| Static/Capacitor tayyorgarlik | ✅ (ixtiyoriy) |

Batafsil ishlar ro‘yxati: `LOYIHA-ISHLARI.md`.

---

## Tezkor havolalar

| Vazifa | Buyruq / URL |
|--------|----------------|
| Saytni ochish | `npm run dev` → http://localhost:3000 |
| Admin kirish | http://localhost:3000/login |
| Mijoz bron | http://localhost:3000/mijoz |
| DB ko‘rish | `npm run db:studio` |

---

*Hujjat yangilangan: 2026 — Yor Yor MVP (veb-asosiy)*
