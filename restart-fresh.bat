@echo off
echo ========================================
echo COMPLETE CACHE CLEAR AND RESTART
echo ========================================
echo.

echo [Step 1/5] Stopping any running servers...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Stopped Node.js processes
) else (
    echo ✓ No Node.js processes running
)
echo.

echo [Step 2/5] Removing .next build folder...
if exist .next (
    rmdir /s /q .next
    echo ✓ Removed .next folder
) else (
    echo ✓ .next folder not found
)
echo.

echo [Step 3/5] Removing node_modules cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo ✓ Removed node_modules/.cache
) else (
    echo ✓ node_modules/.cache not found
)
echo.

echo [Step 4/5] Clearing npm cache...
call npm cache clean --force
echo ✓ npm cache cleared
echo.

echo [Step 5/5] Starting development server...
echo.
echo ========================================
echo Cache cleared! Starting server...
echo ========================================
echo.
echo After server starts:
echo 1. Open browser to http://localhost:3000
echo 2. Press Ctrl+Shift+R to hard refresh
echo 3. Or press F12, right-click refresh, select "Empty Cache and Hard Reload"
echo.
echo ========================================
echo.

call npm run dev
