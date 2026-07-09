@echo off
set BASE_DIR=%~dp0
cd /d %BASE_DIR%

echo ==========================================
echo    MENJALANKAN APLIKASI DASAR PERALATAN
echo ==========================================

echo [1/2] Menjalankan Backend (FastAPI)...
start "Backend - Dasar Peralatan" cmd /k "cd /d %BASE_DIR%backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

echo [2/2] Menjalankan Frontend (Angular)...
start "Frontend - Dasar Peralatan" cmd /k "cd /d %BASE_DIR%frontend && npx ng serve --host 0.0.0.0"

echo.
echo Menunggu server siap (10 detik)...
timeout /t 10

echo Membuka browser di http://localhost:4200...
start http://localhost:4200

echo.
echo Selesai! Jangan tutup jendela terminal yang terbuka.
pause
