# Vercel ga deploy

## Ogohlantirishlar (npm warn deprecated)

Ko‘p qatorlar **xato emas** — `npm install` davomida chiqadigan eskirgan **bog‘liqlik** (dependency) ogohlantirishlari.

| Ogohlantirish | Sabab | Harakat |
|---------------|--------|--------|
| `next@14.2.18` security | Eski Next patch | ✅ Loyihada `14.2.35` ga yangilandi |
| `eslint@8` | Next 14 ESLint 8 bilan | Normal; ESLint 9 ga o‘tish Next 15+ bilan |
| `rimraf`, `glob`, `tar`, `npmlog` | `bcrypt`, Capacitor va boshqalar ichidagi eski paketlar | Ko‘pincha xavfsiz; build to‘xtamaydi |
| `uuid@8` | `next-auth` ichida | Transitive; keyinroq next-auth yangilansa ketadi |

**Muhim:** `npm warn` ≠ deploy muvaffaqiyatsiz. Faqat **qizil xato** (`Error`, `exit code 1`) bo‘lsa build yiqiladi.

---

## Vercel Environment Variables

**Settings → Environment Variables** (Production + Preview):

| O‘zgaruvchi | Majburiy | Misol |
|-------------|----------|--------|
| `DATABASE_URL` | Ha | PostgreSQL URL (Neon, Supabase, Vercel Postgres) — **SQLite ishlamaydi** |
| `NEXTAUTH_URL` | Ha* | `https://sizning-loyiha.vercel.app` |
| `NEXTAUTH_SECRET` | Ha | uzun random string (32+ belgi) |

\* `NEXTAUTH_URL` bo‘lmasa Vercel `VERCEL_URL` dan avtomatik `https://...` yig‘iladi; baribir production domeningizni yozish yaxshiroq.

### Olib tashlang (agar qo‘yilgan bo‘lsa)

| O‘zgaruvchi | Sabab |
|-------------|--------|
| `BUILD_STATIC=1` | Static export — API/Prisma bilan Vercelda **ishlamaydi**, `Invalid URL` va export xatolari |

`npm run build` = oddiy server build (to‘g‘ri variant).

SQLite (`file:./prisma/dev.db`) faqat **lokal** kompyuter uchun.

---

## Build sozlamalari

- **Build Command:** `npm run build` (ichida `prisma generate && next build`)
- **Install Command:** `npm install`
- **Output:** Next.js default (`.next`) — `output: export` faqat `npm run static` da

---

## PostgreSQL ga o‘tish (qisqa)

1. Vercel Storage / Neon / Supabase dan `DATABASE_URL` oling.
2. Vercel Environment ga qo‘ying.
3. Lokal: `DATABASE_URL` ni PostgreSQL qilib `npx prisma db push` yoki `migrate deploy`.
4. `npm run db:seed` (ixtiyoriy).

---

## `TypeError: Invalid URL` (build paytida)

Sabab: `NEXTAUTH_URL` bo‘sh (`""`) yoki noto‘g‘ri — next-auth `new URL()` da yiqiladi.

**Yechim:** yuqoridagi env larni qo‘ying; `BUILD_STATIC` ni olib tashlang; `capacitor.config.ts` bo‘lmasligi kerak (o‘chirilgan).

---

## Qayta deploy

Git push yoki Vercel da **Redeploy** — yangi `package.json` va `package-lock.json` bilan Next 14.2.35 o‘rnatiladi.
