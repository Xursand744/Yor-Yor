@echo off
cd /d "%~dp0"
echo Prisma generate (loyiha versiyasi 5.x)...
call npm run db:generate
if errorlevel 1 exit /b 1
echo.
echo DB push...
call npm run db:push
if errorlevel 1 exit /b 1
echo.
echo Seed...
call npm run db:seed
if errorlevel 1 exit /b 1
echo.
echo Ma'lumotlar bazasi tayyor.
