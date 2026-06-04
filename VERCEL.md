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

Loyiha papkasida (Settings → Environment Variables):

| O‘zgaruvchi | Misol |
|-------------|--------|
| `DATABASE_URL` | PostgreSQL (Vercel Postgres, Neon, Supabase…) — **SQLite Vercelda ishlamaydi** |
| `NEXTAUTH_URL` | `https://sizning-loyiha.vercel.app` |
| `NEXTAUTH_SECRET` | uzun random string (32+ belgi) |

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

## Qayta deploy

Git push yoki Vercel da **Redeploy** — yangi `package.json` va `package-lock.json` bilan Next 14.2.35 o‘rnatiladi.
