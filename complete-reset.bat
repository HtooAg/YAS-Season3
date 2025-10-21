@echo off
echo ========================================
echo COMPLETE RESET - Everything Fresh
echo ========================================
echo.
echo This will:
echo - Clear Next.js build cache
echo - Clear npm cache
echo - Reset GCS game state
echo - Restart development server
echo.
pause
echo.

echo [1/5] Stopping any running servers...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Stopped Node.js processes
    timeout /t 2 /nobreak >nul
) else (
    echo ✓ No Node.js processes running
)
echo.

echo [2/5] Clearing build caches...
if exist .next (
    rmdir /s /q .next
    echo ✓ Removed .next folder
)
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo ✓ Removed node_modules cache
)
echo.

echo [3/5] Starting development server...
start /B cmd /c "npm run dev > server.log 2>&1"
echo ✓ Server starting in background...
echo   Waiting 15 seconds for server to be ready...
timeout /t 15 /nobreak >nul
echo.

echo [4/5] Resetting GCS game state...
curl -X DELETE http://localhost:3000/api/game
if %errorlevel% equ 0 (
    echo ✓ GCS game state reset successfully
) else (
    echo ⚠ Could not reset GCS (server might still be starting)
    echo   You can manually reset from admin panel
)
echo.

echo [5/5] Done!
echo.
echo ========================================
echo Reset Complete!
echo ========================================
echo.
echo Server is running at: http://localhost:3000
echo.
echo IMPORTANT - Do these steps now:
echo.
echo 1. Open your browser to http://localhost:3000
echo 2. Press F12 to open DevTools
echo 3. In Console tab, run:
echo    localStorage.clear(); sessionStorage.clear();
echo 4. Press Ctrl+Shift+R to hard refresh
echo.
echo Your scenarios should now be updated!
echo.
echo To verify:
echo - Scenario 2 "Sell Half" should show: Coins: +800, Crops: -4
echo - "Do Nothing" options should show: Coins: 0, Crops: 0
echo.
echo ========================================
pause
