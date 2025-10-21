# Quick Fix - Update GCS with New Scenarios

## The Issue

Your GCS has old scenario data. The code is correct, but GCS needs to be reset.

---

## ⚡ FASTEST FIX (3 steps)

### Step 1: Run this script

```bash
complete-reset.bat
```

### Step 2: In browser console (F12)

```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Step 3: Hard refresh

Press `Ctrl + Shift + R`

---

## 🎯 Manual Fix (if script doesn't work)

### 1. Make sure server is running

```bash
npm run dev
```

### 2. Reset GCS in a new terminal

```bash
curl -X DELETE http://localhost:3000/api/game
```

### 3. Clear browser storage

Open console (F12) and run:

```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## ✅ Verify It Worked

Go to Scenario 2 and check:

-   **"Sell Half"** should show: `Coins: +800` and `Crops: -4` ✅
-   **"Keep All"** should show: `Coins: 0` and `Crops: 0` ✅

Go to Scenario 1 or 3 and check:

-   **"Do Nothing"** should show: `Coins: 0` and `Crops: 0` ✅

---

## 🔧 If Still Not Working

Try this PowerShell command instead:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/game" -Method Delete
```

Or use the admin panel:

1. Go to http://localhost:3000/admin
2. Click "Reset Game" button
3. Refresh browser

---

## 📝 What Each Script Does

| Script               | What it does                             |
| -------------------- | ---------------------------------------- |
| `complete-reset.bat` | Full reset: cache + GCS + restart server |
| `reset-game-gcs.bat` | Just reset GCS game state                |
| `restart-fresh.bat`  | Clear cache + restart server             |
| `clear-cache.bat`    | Just clear Next.js cache                 |

**Recommended:** Use `complete-reset.bat` for a fresh start.
