# Test Calculations - Verify Your Display

## Scenario 2: Sell Half (Most Important)

### Team State:

-   Coins: 1000
-   Crops: 8

### "Sell Half" Calculation:

```javascript
// Step 1: Calculate half crops
halfCrops = Math.floor(8 / 2) = 4

// Step 2: Calculate coins gained
coinsGained = 4 * 200 = 800

// Step 3: Calculate crops sold
cropsSold = -4

// Result:
coinsDelta = 800
cropsDelta = -4
```

### Display Should Show:

```
Sell Half
Sell half your crops for 200 coins each
Coins: +800    Crops: -4
```

### After Submission:

```
Your Outcome:
Coins: +800
Crops: -4

Your Farm After This Decision:
Coins: 1800 (1000 + 800)
Crops: 4 (8 - 4)
```

---

## All Scenarios Test Cases

### Scenario 1: Pest Outbreak

| Option         | Coins Display       | Crops Display      |
| -------------- | ------------------- | ------------------ |
| Buy Pesticide  | `Coins: -200` (red) | `Crops: -1` (red)  |
| Natural Remedy | `Coins: -50` (red)  | `Crops: -2` (red)  |
| Do Nothing     | `Coins: 0` (green)  | `Crops: 0` (green) |

### Scenario 2: Market Opportunity (8 crops)

| Option    | Coins Display         | Crops Display      |
| --------- | --------------------- | ------------------ |
| Sell Half | `Coins: +800` (green) | `Crops: -4` (red)  |
| Keep All  | `Coins: 0` (green)    | `Crops: 0` (green) |

### Scenario 3: Drought Warning

| Option                    | Coins Display       | Crops Display      |
| ------------------------- | ------------------- | ------------------ |
| Invest in Drip Irrigation | `Coins: -300` (red) | `Crops: -1` (red)  |
| Buy Water Rights          | `Coins: -150` (red) | `Crops: -2` (red)  |
| Do Nothing                | `Coins: 0` (green)  | `Crops: 0` (green) |

### Scenario 4: Final Harvest (5 crops remaining)

| Option               | Coins Display      | Crops Display     |
| -------------------- | ------------------ | ----------------- |
| Sell Remaining Crops | `Coins: 0` (green) | `Crops: -5` (red) |

---

## Quick Browser Test

Open browser console (`F12`) and run this to test the calculation:

```javascript
// Test Sell Half calculation
const team = { crops: 8, coins: 1000 };
const halfCrops = Math.floor(team.crops / 2);
const coinsGained = halfCrops * 200;
const cropsSold = -halfCrops;

console.log("Sell Half Results:");
console.log("Half Crops:", halfCrops);
console.log("Coins Gained:", coinsGained);
console.log("Crops Sold:", cropsSold);
console.log(
	"Expected Display: Coins: +" + coinsGained + ", Crops: " + cropsSold
);
```

Expected output:

```
Sell Half Results:
Half Crops: 4
Coins Gained: 800
Crops Sold: -4
Expected Display: Coins: +800, Crops: -4
```

---

## Visual Reference

### What You Should See:

```
┌─────────────────────────────────────────┐
│ Sell Half (4 crops)                     │
│ Sell half your crops for 200 coins each│
│                                         │
│ Coins: +800    Crops: -4               │
│ (green)        (red)                    │
└─────────────────────────────────────────┘
```

### What You Should NOT See:

```
┌─────────────────────────────────────────┐
│ Sell Half (4 crops)                     │
│ Sell half your crops for 200 coins each│
│                                         │
│ (no delta text showing)                 │
└─────────────────────────────────────────┘
```

---

## If Delta Text Still Not Showing

### Check 1: Verify myTeam exists

Open console and run:

```javascript
// This should show your team data
console.log("myTeam:", sessionStorage.getItem("yas-harvest-team-id"));
```

### Check 2: Verify scenarios loaded

```javascript
fetch("/api/game")
	.then((r) => r.json())
	.then((data) => {
		console.log("Scenario 2:", data.scenarios[1]);
	});
```

### Check 3: Hard refresh

1. Press `Ctrl + Shift + R` multiple times
2. Or press `F12`, right-click refresh, "Empty Cache and Hard Reload"

### Check 4: Clear everything

```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```
