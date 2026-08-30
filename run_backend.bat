@echo off
echo ===================================================
echo   Starting AgroPulse FastAPI Backend on Port 8000
echo ===================================================
cd /d "%~dp0backend"
call ".\venv\Scripts\python.exe" -m uvicorn app.main:app --reload --port 8000
pause
