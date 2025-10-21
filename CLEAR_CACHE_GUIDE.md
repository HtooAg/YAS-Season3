# How to Clear Cache and See Updates

## Quick Method (Recommended)

### Option 1: Run the Clear Cache Script
```bash
# On Windows
clear-cache.bat

# Or manually:
rmdir /s /q .next
npm cache clean --force
```

### Option 2: Hard Refresh Browser
1. Open your browser
2. Press **Ctrl + Shift + R** (Windows/Linux)
3. Or **Ctrl + F5**
4. Or **Shift + F5**

---

## Complete Cache Clearing Steps

### 1. Stop Development Server
- Press `Ctrl + C` in the terminal running the dev server

### 2. Clear Next.js Build Cache
```bash
# Remove .next folder
rmdir /s /q .next

# Or on PowerShell
Remove-Item -Recurse -Force .next
```

### 3. Clear Node Modules Cache
```bash
# Remove node_modules cache
rmdir /s /q node_modules\.cache

# Or on PowerShell
Remove-Item -Recurse -Force node_modules\.cache
```

### 4. Clear NPM Cache
```bash
npm cache clean --force
```

### 5. Restart Development Server
```bash
npm run dev
```

### 6. Clear Browser Cache
**Chrome/Edge:**
1. Press `F12` to open DevTools
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Or use keyboard shortcuts:**
- `Ctrl + Shift + R` (Hard refresh)
- `Ctrl + F5` (Hard refresh)
- `Shift + F5` (Hard refresh)

---

## Browser-Specific Instructions

### Chrome/Edge
1. Open DevTools (`F12`)
2. Go to Network tab
3. Check "Disable cache" checkbox
4. Keep DevTools open while testing

### Firefox
1. Open DevTools (`F12`)
2. Go to Network tab
3. Check "Disable cache" checkbox
4. Keep DevTools open while testing

---

## If Updates Still Don't Show

### 1. Clear Browser Data Completely
**Chrome/Edge:**
- Press `Ctrl + Shift + Delete`
- Select "Cached images and files"
- Click "Clear data"

**Firefox:**
- Press `Ctrl + Shift + Delete`
- Select "Cache"
- Click "Clear Now"

### 2. Check if Server Restarted
```bash
# Stop server
Ctrl + C

# Start server again
npm run dev
```

### 3. Check localStorage/sessionStorage
Open browser console (`F12`) and run:
```javascript
// Clear all storage
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### 4. Try Incognito/Private Mode
- Chrome: `Ctrl + Shift + N`
- Firefox: `Ctrl + Shift + P`
- Edge: `Ctrl + Shift + N`

---

## Verify Changes Are Applied

### Check Scenario 2 "Sell Half"
1. Open the game
2. Go to Scenario 2
3. Look at "Sell Half" option
4. Should show: **`Coins: +800`** and **`Crops: -4`** (for 8 crops)

### Check "Do Nothing" Options
1. Scenario 1 - "Do Nothing" should show: `Coins: 0`, `Crops: 0`
2. Scenario 3 - "Do Nothing" should show: `Coins: 0`, `Crops: 0`

---

## Quick Verification Script

Run this in browser console to check current scenario data:
```javascript
// Check if scenarios are loaded correctly
fetch('/api/game')
  .then(r => r.json())
  .then(data => {
    console.log('Scenario 2 choices:', data.scenarios[1].choices);
  });
```

---

## Common Issues

### Issue: Changes not showing after refresh
**Solution:** 
1. Stop dev server (`Ctrl + C`)
2. Delete `.next` folder
3. Restart dev server (`npm run dev`)
4. Hard refresh browser (`Ctrl + Shift + R`)

### Issue: Old data still in game state
**Solution:**
1. Open browser console (`F12`)
2. Run: `localStorage.clear(); sessionStorage.clear();`
3. Refresh page

### Issue: Server not picking up changes
**Solution:**
1. Check if file was saved
2. Restart dev server
3. Check terminal for errors

---

## Automated Cache Clear (PowerShell)

Create a file `clear-all.ps1`:
```powershell
Write-Host "Clearing all caches..." -ForegroundColor Cyan

# Stop any running processes on port 3000
$process = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($process) {
    Stop-Process -Id $process.OwningProcess -Force
    Write-Host "✓ Stopped dev server" -ForegroundColor Green
}

# Clear Next.js cache
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host "✓ Cleared .next" -ForegroundColor Green
}

# Clear node_modules cache
if (Test-Path node_modules\.cache) {
    Remove-Item -Recurse -Force node_modules\.cache
    Write-Host "✓ Cleared node_modules cache" -ForegroundColor Green
}

# Clear npm cache
npm cache clean --force
Write-Host "✓ Cleared npm cache" -ForegroundColor Green

Write-Host "`nCache cleared! Now run: npm run dev" -ForegroundColor Yellow
```

Run with: `powershell -ExecutionPolicy Bypass -File clear-all.ps1`

---

## Summary

**Fastest method:**
1. Stop server (`Ctrl + C`)
2. Run `clear-cache.bat`
3. Start server (`npm run dev`)
4. Hard refresh browser (`Ctrl + Shift + R`)

**If that doesn't work:**
1. Clear browser cache completely (`Ctrl + Shift + Delete`)
2. Clear localStorage/sessionStorage (console: `localStorage.clear()`)
3. Try incognito mode
