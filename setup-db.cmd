@echo off
cd /d "%~dp0"
echo Eski Next.js serverlar to'xtatilmoqda (3000-3002)...
for %%P in (3000 3001 3002) do (
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%P ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
  )
)
timeout /t 2 /nobreak >nul

echo SQLite bazasi sozlanmoqda...
call npm run db:generate
if errorlevel 1 (
  echo generate xato — barcha terminaldagi "npm run dev" ni Ctrl+C bilan to'xtating.
  pause
  exit /b 1
)
call npm run db:push -- --accept-data-loss
if errorlevel 1 goto err
call npm run db:seed
if errorlevel 1 goto err
echo.
echo ========================================
echo   TAYYOR! Endi: npm run dev
echo   http://localhost:3000/login
echo   admin@toy24.uz / Admin123!
echo ========================================
goto end
:err
echo Xato yuz berdi.
:end
pause
