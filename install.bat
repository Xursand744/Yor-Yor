@echo off
cd /d "%~dp0"
echo Installing dependencies...
call npm install
if errorlevel 1 exit /b 1
echo.
echo Done. Next steps:
echo   1. copy .env.example .env
echo   2. npm run db:generate
echo   3. db-setup.bat   (yoki: npx prisma migrate deploy ^& npm run db:seed)
echo   4. npm run dev
echo   5. Brauzer: http://localhost:3000/boshqaruv
pause
