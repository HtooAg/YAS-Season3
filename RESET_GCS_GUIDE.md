# How to Reset GCS Game State

## The Problem

The game state is cached in Google Cloud Storage (GCS). When you update `lib/scenarios.ts`, the changes won't appear until you reset the game state in GCS.

**Old data in GCS:**

-   Scenario 1 "Do Nothing": -3 crops ❌
-   Scenario 2 "Sell Half": missing coinsDelta/cropsDelta ❌
-   Scenario 3 "Hope for Rain": -3 crops ❌

**New data in code:**

-   Scenario 1 "Do Nothing": 0 crops ✅
-   Scenario 2 "Sell Half": +800 coins, -4 crops ✅
-   Scenario 3 "Do Nothing": 0 crops ✅

---

## Quick Solution

### Method 1: Use the Reset Script (Easiest)

1. Make sure your dev server is running (`npm run dev`)
2. Run the reset script:
    ```bash
    reset-game-gcs.bat
    ```
3. Refresh your browser (`Ctrl + Shift + R`)

### Method 2: Use Admin Panel

1. Open the admin panel: http://localhost:3000/admin
2. Click the **"Reset Game"** button
3. Refresh your browser

### Method 3: Use curl Command

```bash
curl -X DELETE http://localhost:3000/api/game
```

### Method 4: Use Browser Console

1. Open browser console (`F12`)
2. Run this code:
    ```javascript
    fetch("/api/game", { method: "DELETE" })
    	.then((r) => r.json())
    	.then((data) => {
    		console.log("Game reset:", data);
    		location.reload();
    	});
    ```

---

## Step-by-Step Manual Reset

### Step 1: Make sure server is running

```bash
npm run dev
```

### Step 2: Reset the game state

Open a new terminal and run:

```bash
curl -X DELETE http://localhost:3000/api/game
```

Or use PowerShell:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/game" -Method Delete
```

### Step 3: Clear browser cache

1. Press `Ctrl + Shift + R` (hard refresh)
2. Or press `F12`, right-click refresh, select "Empty Cache and Hard Reload"

### Step 4: Clear localStorage

Open browser console (`F12`) and run:

```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## Verify the Reset Worked

### Check in Browser

1. Open: http://localhost:3000/player
2. Claim a team
3. Start the game (from admin panel)
4. Go to Scenario 2
5. Check "Sell Half" option:
    - Should show: **`Coins: +800`** ✅
    - Should show: **`Crops: -4`** ✅

### Check GCS Data

You can verify the GCS data by visiting:

```
http://localhost:3000/api/game
```

Look for Scenario 2 "Sell Half":

```json
{
	"id": "market-2-a",
	"label": "Sell Half",
	"desc": "Sell half your crops for 200 coins each"
}
```

Note: The `coinsDelta` and `cropsDelta` functions won't appear in JSON because they're functions, but they will work correctly in the game.

---

## Complete Reset Process

If the above doesn't work, do a complete reset:

### 1. Stop the server

```bash
Ctrl + C
```

### 2. Clear all caches

```bash
rmdir /s /q .next
rmdir /s /q node_modules\.cache
npm cache clean --force
```

### 3. Start the server

```bash
npm run dev
```

### 4. Reset GCS game state

```bash
curl -X DELETE http://localhost:3000/api/game
```

### 5. Clear browser

-   Clear cache: `Ctrl + Shift + Delete`
-   Clear storage: Console → `localStorage.clear(); sessionStorage.clear();`
-   Hard refresh: `Ctrl + Shift + R`

---

## Why This Happens

The game state is stored in GCS and includes a snapshot of the scenarios. When you update `lib/scenarios.ts`, the code changes but GCS still has the old snapshot.

**Solution:** Reset the game to force it to reload scenarios from the code.

---

## Automated Complete Reset

Create a file `complete-reset.bat`:

```batch
@echo off
echo ========================================
echo COMPLETE RESET - Code + GCS + Cache
echo ========================================
echo.

echo [1/6] Stopping server...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/6] Clearing .next...
if exist .next rmdir /s /q .next

echo [3/6] Clearing node cache...
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo [4/6] Starting server...
start /B npm run dev
timeout /t 10 /nobreak >nul

echo [5/6] Resetting GCS game state...
curl -X DELETE http://localhost:3000/api/game

echo [6/6] Done!
echo.
echo ========================================
echo Complete reset finished!
echo.
echo Now:
echo 1. Open http://localhost:3000
echo 2. Press Ctrl+Shift+R to hard refresh
echo 3. Clear localStorage in console
echo ========================================
pause
```

---

## Quick Reference

| Action               | Command                                         |
| -------------------- | ----------------------------------------------- |
| Reset GCS            | `curl -X DELETE http://localhost:3000/api/game` |
| Clear .next          | `rmdir /s /q .next`                             |
| Clear npm cache      | `npm cache clean --force`                       |
| Hard refresh browser | `Ctrl + Shift + R`                              |
| Clear localStorage   | Console: `localStorage.clear()`                 |

---

## Troubleshooting

### Issue: curl command not found

**Solution:** Use PowerShell instead:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/game" -Method Delete
```

### Issue: Server not responding

**Solution:** Make sure server is running:

```bash
npm run dev
```

### Issue: Changes still not showing

**Solution:** Do complete reset:

1. Stop server
2. Delete `.next` folder
3. Reset GCS: `curl -X DELETE http://localhost:3000/api/game`
4. Start server
5. Clear browser cache completely
6. Clear localStorage/sessionStorage

### Issue: "Game state not found" error

**Solution:** This is normal after reset. Just start a new game from the admin panel.
