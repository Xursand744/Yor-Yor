@echo off
cd /d "%~dp0"
echo NextAuth va Tailwind kutubxonalari o'rnatilmoqda...
call npm install
if errorlevel 1 exit /b 1
echo.
echo Keyingi qadamlar:
echo   1. .env ichiga NEXTAUTH_URL va NEXTAUTH_SECRET qo'shing
echo   2. db-setup.bat
echo   3. npm run dev
echo   4. http://localhost:3000/login
echo.
echo Demo hisoblar (seed dan keyin):
echo   admin@toy24.uz / Admin123!
echo   manager@toy24.uz / Manager123!
pause
