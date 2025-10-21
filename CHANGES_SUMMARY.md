# Complete Rewrite Summary

## What Changed

### ✅ Simplified Scenarios

-   **Removed:** Complex probabilistic outcomes (fx functions)
-   **Removed:** Long descriptions with multiple outcomes
-   **Added:** Simple, clear choices with predictable results

### ✅ Cleaner Code

-   **lib/scenarios.ts:** Reduced from 200+ lines to 90 lines
-   **lib/game-context.tsx:** Simplified submitAnswer function
-   **lib/types.ts:** Removed unused fx function type
-   **app/player/scenario/page.tsx:** Simplified display logic

### ✅ Easy to Understand

#### Old Scenario 2 "Sell Half":

```typescript
// Complex with fx function, dynamic descriptions, multiple calculations
desc: (team) => {
  const halfCrops = Math.floor(team.crops / 2);
  const remainingCrops = team.crops - halfCrops;
  const immediateCoins = halfCrops * 200;
  return `Immediate: +${immediateCoins} coins\n...`;
},
fx: (team) => {
  // More calculations...
}
```

#### New Scenario 2 "Sell Half":

```typescript
// Simple and clear
label: "Sell Half",
desc: "Sell half your crops for coins",
coinsDelta: (team) => Math.floor(team.crops / 2) * 100,
cropsDelta: (team) => -Math.floor(team.crops / 2),
```

---

## New Scenarios

### 1. Pest Outbreak

-   Buy Pesticide: -200 coins, -1 crop
-   Natural Remedy: -50 coins, -2 crops
-   Do Nothing: 0 coins, -3 crops

### 2. Market Opportunity

-   Sell Half: +(crops/2 × 100) coins, -(crops/2) crops
-   Sell All: +(crops × 100) coins, -all crops
-   Keep All: no change

### 3. Drought Warning

-   Buy Irrigation: -300 coins, -1 crop
-   Buy Water: -150 coins, -2 crops
-   Hope for Rain: 0 coins, -3 crops

### 4. Final Harvest

-   Sell Remaining Crops: 0 coins, -all crops (crops become 0)

---

## How It Works Now

### Display (Before Submission)

```
Sell Half
Sell half your crops for coins
Coins: +400  Crops: -4
```

### Calculation (On Submission)

```typescript
// Simple calculation
coinsDelta = Math.floor(8 / 2) * 100 = 400
cropsDelta = -Math.floor(8 / 2) = -4

// Apply timer bonus/penalty
if (answered in time) coinsDelta += 50
if (answered late) coinsDelta -= 30

// Update team
team.coins += coinsDelta
team.crops += cropsDelta
```

### Display (After Submission)

```
Your Outcome:
Coins: +400
Crops: -4

Your Farm After This Decision:
Coins: 1400
Crops: 4
```

---

## Benefits

1. **Easy to Read:** No complex nested logic
2. **Easy to Modify:** Change numbers directly in scenarios.ts
3. **Easy to Debug:** Straightforward calculations
4. **Easy to Test:** Predictable outcomes
5. **Easy to Extend:** Add new scenarios by copying the pattern

---

## Files Modified

-   ✅ `lib/scenarios.ts` - Complete rewrite
-   ✅ `lib/game-context.tsx` - Simplified submitAnswer
-   ✅ `lib/types.ts` - Removed fx function type
-   ✅ `app/player/scenario/page.tsx` - Simplified display

## Files Created

-   📄 `SCENARIOS.md` - Documentation
-   📄 `CHANGES_SUMMARY.md` - This file

---

## Testing

### Example: Team with 8 crops, 1000 coins

**Scenario 2 - Sell Half:**

1. Display shows: `Coins: +400` and `Crops: -4`
2. Player submits within time
3. Calculation: 400 coins + 50 bonus = +450 coins, -4 crops
4. Result: 1450 coins, 4 crops
5. Display shows final values

**All calculations are now simple and predictable!**
