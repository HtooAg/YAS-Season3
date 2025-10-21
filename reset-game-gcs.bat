@echo off
echo ========================================
echo RESET GAME STATE IN GCS
echo ========================================
echo.
echo This will reset the game and load fresh scenarios
echo from your code (lib/scenarios.ts)
echo.
pause
echo.

echo Sending DELETE request to reset game...
curl -X DELETE http://localhost:3000/api/game
echo.
echo.

echo ========================================
echo Game state reset!
echo ========================================
echo.
echo The game has been reset and will now use
echo the updated scenarios from lib/scenarios.ts
echo.
echo Next steps:
echo 1. Refresh your browser (Ctrl+Shift+R)
echo 2. The game should now show updated scenarios
echo.
pause
