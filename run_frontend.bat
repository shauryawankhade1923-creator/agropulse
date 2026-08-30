@echo off
echo ===================================================
echo   Starting AgroPulse React Frontend on Port 5173
echo ===================================================
cd /d "%~dp0frontend"
call npm run dev
pause
