@echo off
cd /d "%~dp0"
if not exist "node_modules\next-auth" (
  echo npm install...
  call npm install
)
call npm run dev
