@echo off
cd /d "%~dp0"
echo Prisma client yaratilmoqda...
call npm run db:generate
if errorlevel 1 goto err
echo.
echo Jadvallar yaratilmoqda...
call npm run db:push
if errorlevel 1 goto err
echo.
echo Foydalanuvchilar qo'shilmoqda...
call npm run db:seed
if errorlevel 1 goto err
echo.
echo TAYYOR! Kirish:
echo   admin@toy24.uz / Admin123!
echo   manager@toy24.uz / Manager123!
goto end
:err
echo.
echo XATO: PostgreSQL ishlamayapti yoki DATABASE_URL noto'g'ri.
echo .env faylini tekshiring.
:end
pause
