@echo off
echo ========================================
echo Clearing Next.js Cache
echo ========================================

echo.
echo [1/4] Removing .next folder...
if exist .next (
    rmdir /s /q .next
    echo ✓ .next folder removed
) else (
    echo ✓ .next folder not found (already clean)
)

echo.
echo [2/4] Removing node_modules/.cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo ✓ node_modules/.cache removed
) else (
    echo ✓ node_modules/.cache not found (already clean)
)

echo.
echo [3/4] Clearing npm cache...
call npm cache clean --force
echo ✓ npm cache cleared

echo.
echo [4/4] Done!
echo ========================================
echo Cache cleared successfully!
echo.
echo Next steps:
echo 1. Restart your development server
echo 2. Hard refresh browser (Ctrl+Shift+R or Ctrl+F5)
echo ========================================
pause
