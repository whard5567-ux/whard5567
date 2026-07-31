@echo off
set BASE_DIR=%~dp0

echo ==========================================
echo    MENJALANKAN APLIKASI DASHBOARD (NEXT.JS)
echo ==========================================

echo [1/2] Menjalankan Backend (FastAPI)...
start "Backend - Dasar Peralatan" cmd /k "cd /d "%BASE_DIR%backend" && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

echo [2/2] Menjalankan Frontend (Next.js)...
start "Frontend - Dashboard" cmd /k "cd /d "%BASE_DIR%dashboard-hargi-ht2\app" && npm run dev"

echo.
echo Menunggu server Next.js siap (30 detik)...
timeout /t 30

echo Membuka browser di http://localhost:3000...
start http://localhost:3000

echo.
echo Selesai! Jangan tutup jendela terminal yang terbuka.
pause
