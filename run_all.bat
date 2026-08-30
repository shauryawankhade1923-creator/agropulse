@echo off
echo ===================================================
echo   Launching AgroPulse (Backend + Frontend)
echo ===================================================
start "AgroPulse Backend (FastAPI)" cmd /k ""%~dp0run_backend.bat""
timeout /t 2 /nobreak >nul
start "AgroPulse Frontend (React Vite)" cmd /k ""%~dp0run_frontend.bat""
echo.
echo Backend running at:  http://127.0.0.1:8000/docs
echo Frontend running at: http://localhost:5173
echo.
pause
