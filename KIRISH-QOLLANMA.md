# To'y24 — kirish

PostgreSQL **kerak emas**. Loyiha **SQLite** ishlatadi (`prisma/dev.db` fayli).

## Birinchi marta

1. `setup-db.cmd` — ikki marta bosing (bazani yaratadi)
2. `npm run dev`
3. Brauzer: **http://localhost:3000/login**

## Kirish (ism + familiya + telefon)

| Ism | Familiya | Telefon |
|-----|----------|---------|
| Super | Admin | +998900000001 |
| Bekzod | Rahimov | +998900000002 |

Yangi foydalanuvchilar: **http://localhost:3000/royxatdan-otish**

## Login ishlamasa

- Terminaldagi portni `.env` dagi `NEXTAUTH_URL` ga moslang
- `setup-db.cmd` ni qayta ishga tushiring
- `npm run dev` dan oldin eski serverni to'xtating (Ctrl+C)
