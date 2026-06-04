# Yor Yor — bajarilgan ishlar hisoboti

Loyiha: Next.js 14 (App Router) + Tailwind CSS + NextAuth + Prisma  
Maqsad: to‘yxona bron platformasi (MVP) va Android (APK) uchun static export tayyorgarligi.

---

## 1. Brend va UI (bosh sahifa + navigatsiya)

| Vazifa | Holat |
|--------|--------|
| Sayt nomi **Yor Yor**, lyuks dizayn (binafsha / fuchsia) | ✅ |
| `components/Navbar.tsx` — GSAP, `useSession`, kirish/chiqish | ✅ |
| `components/home/LandingPage.tsx` — hero, qidiruv, kartochkalar, GSAP | ✅ |
| `app/page.tsx` — `listVenues()` + `LandingPage` | ✅ |
| Metadata, `AuthChrome` brendi | ✅ |

---

## 2. Kirish va parol

| Vazifa | Holat |
|--------|--------|
| Login: ism, familiya, telefon, **parol** | ✅ |
| `lib/auth.ts` — `bcrypt` bilan parol tekshiruvi | ✅ |
| **Parolni unutdingizmi?** modal (`ForgotPasswordPanel.tsx`) | ✅ |
| `POST /api/auth/reset-password` | ✅ |
| Sessiyada **telefon** (JWT + session types) | ✅ |
| `lib/auth-redirect.ts` — rol bo‘yicha redirect | ✅ |

### Rol bo‘yicha yo‘naltirish

| Rol | Sahifa |
|-----|--------|
| `client` (mijoz) | `/mijoz` |
| `manager` (tadbirkor / to‘yxona egasi) | `/admin` |
| `admin` | `/admin` |

---

## 3. Ro‘yxatdan o‘tish

| Vazifa | Holat |
|--------|--------|
| Ro‘yxatda parol + tasdiqlash | ✅ |
| Muvaffaqiyatdan keyin avtomatik `signIn` | ✅ |
| Rol bo‘yicha avtomatik redirect | ✅ |
| Zod `discriminatedUnion` + `refine` tuzatildi | ✅ |
| Aniqroq API xatolari (`lib/api-error.ts`) | ✅ |

---

## 4. Texnik tuzatishlar

| Muammo | Yechim |
|--------|--------|
| Login inputlarga yozib bo‘lmaydi (GSAP) | `revertOnUpdate: false`, animatsiya inputlardan olib tashlandi |
| Hydration: `52 000 000` vs `52,000,000` | `formatUzs` — barqaror formatlash (`lib/format.ts`) |
| Ro‘yxatdan o‘tishda “Tarmoq xatosi” | Server 500 (Zod schema) tuzatildi |
| ESLint `'` xatolari (static build) | `AdminPanel.tsx`, `VenueBookingWizard.tsx` — `&apos;` |
| `RegisterWizard` TypeScript | Progress bar `done`/`active` mantiqi tuzatildi |

---

## 5. Android (static export) tayyorgarligi

`next.config.mjs`:

```js
output: "export",
images: { unoptimized: true },
```

`package.json`:

```json
"static": "next build"
```

Build natijasi: loyiha ildizida **`out`** papkasi (`.gitignore`da).

### Paketlar (o‘rnatish)

```bash
npm install gsap @gsap/react lucide-react
npm run static
```

---

## 6. Asosiy fayllar

### Yangi

- `components/Navbar.tsx`
- `app/login/ForgotPasswordPanel.tsx`
- `app/api/auth/reset-password/route.ts`
- `lib/auth-redirect.ts`
- `lib/api-error.ts`
- `lib/api-url.ts`
- `scripts/static-export.mjs`
- `capacitor.config.ts`
- `components/mijoz/MuvaffaqiyatView.tsx`

### O‘zgartirilgan

- `components/home/LandingPage.tsx`
- `app/page.tsx`
- `app/login/LoginForm.tsx`
- `app/login/page.tsx`
- `lib/auth.ts`
- `lib/validations/auth.ts`
- `lib/services/register.ts`
- `lib/format.ts`
- `components/auth/RegisterWizard.tsx`
- `components/auth/AuthChrome.tsx`
- `components/admin/AdminPanel.tsx`
- `components/mijoz/VenueBookingWizard.tsx`
- `types/next-auth.d.ts`
- `app/layout.tsx`
- `tailwind.config.ts`
- `next.config.mjs`
- `package.json`

---

## 7. Static export va Capacitor (yangilandi)

| Vazifa | Holat |
|--------|--------|
| `npm run static` — API/middleware vaqtincha stash | ✅ `scripts/static-export.mjs` |
| `BUILD_STATIC=1` — faqat static buildda `output: "export"` | ✅ `next.config.mjs` |
| `npm run build` — server (API bilan) | ✅ |
| `lib/api-url.ts` — `NEXT_PUBLIC_API_URL` | ✅ |
| Barcha client `fetch` → `apiUrl()` | ✅ |
| `next.config` `env.NEXTAUTH_URL` (APK build uchun) | ✅ |
| `generateStaticParams` — `mijoz/[venueId]` | ✅ |
| Muvaffaqiyat — client + API | ✅ `MuvaffaqiyatView.tsx` |
| Capacitor — `webDir: 'out'`, `cap:sync`, `cap:android` | ✅ |
| `lib/auth.ts` role TypeScript | ✅ |

### APK build ketma-ketligi

```bash
# 1. Production API (alohida server)
npm run build && npm start

# 2. Static frontend (.env.local da NEXT_PUBLIC_API_URL)
npm run static
npx cap add android   # birinchi marta
npm run cap:sync
npm run cap:android
```

---

## 8. Hali ochiq

| Mavzu | Izoh |
|-------|------|
| Eski foydalanuvchilar | Tasodifiy parol bilan yaratilganlar **Parolni tiklash** orqali parol o‘rnatishi kerak bo‘lishi mumkin |
| Yangi venue (builddan keyin) | Static APK da `mijoz/[venueId]` faqat build vaqtidagi ID lar; yangilash uchun qayta `npm run static` |

---

*Yangilangan: 2026 — Yor Yor MVP ishlari jamlanmasi*
