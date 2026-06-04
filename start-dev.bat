@echo off
cd /d "%~dp0"
title To'y24 Dev Server

echo [1/4] Kutubxonalar tekshirilmoqda...
if not exist "node_modules\next-auth" (
  call npm install
  if errorlevel 1 (
    echo npm install xato berdi!
    pause
    exit /b 1
  )
)

if not exist ".env" (
  copy .env.example .env
)

echo [2/4] Prisma client...
call npm run db:generate
if errorlevel 1 goto db_error

echo [3/4] Ma'lumotlar bazasi...
call npm run db:push
if errorlevel 1 goto db_error
call npm run db:seed
if errorlevel 1 goto db_error
goto start_server

:db_error
echo.
echo OGOHLANTIRISH: PostgreSQL ulanmadi yoki Prisma xato.
echo   - PostgreSQL ishlayaptimi?
echo   - .env dagi DATABASE_URL to'g'rimi?
echo.
echo Login sahifasini ko'rish uchun server baribir ishga tushadi.
echo Kirish ishlashi uchun DB kerak.
echo.
pause

:start_server
echo [4/4] Dev server...
echo.
echo ==========================================
echo   Brauzerda oching:
echo   http://localhost:3000/login
echo.
echo   Admin: admin@toy24.uz
echo   Parol: Admin123!
echo ==========================================
echo.

call npm run dev
pause
