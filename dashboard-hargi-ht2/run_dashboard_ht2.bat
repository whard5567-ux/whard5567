@echo off
set BASE_DIR=%~dp0
cd /d "%BASE_DIR%dashboard-hargi-ht2\app"

echo ==========================================
echo    MENJALANKAN DASHBOARD HARGI HT2
echo ==========================================

echo [1/1] Menjalankan Next.js (Port 3000)...
start "Dashboard Hartrans 2" cmd /k "npm run dev -- --port 3000"

echo.
echo Menunggu server siap (5 detik)...
timeout /t 5

echo Membuka browser di http://localhost:3000...
start http://localhost:3000

echo.
echo Selesai! Jangan tutup jendela terminal yang terbuka.
