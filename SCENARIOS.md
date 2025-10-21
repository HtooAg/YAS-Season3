# Game Scenarios - Updated Version

## Overview

The game has 4 scenarios with straightforward calculations.

---

## Scenario 1: Pest Outbreak Spreading

**Situation:** Pests are attacking your farm

**Choices:**

1. **Buy Pesticide** → -200 coins, -1 crop
2. **Natural Remedy** → -50 coins, -2 crops
3. **Do Nothing** → 0 coins, 0 crops (no change)

**Strategy:** Spend money to save crops, or do nothing and keep everything as is.

---

## Scenario 2: Market Opportunity

**Situation:** High prices! Sell crops for 200 coins each

**Choices:**

1. **Sell Half** → +(crops/2 × 200) coins, -(crops/2) crops
2. **Keep All** → 0 coins, 0 crops (no change)

**Example:** If you have 8 crops:

-   Sell Half: +800 coins, -4 crops
-   Keep All: no change

---

## Scenario 3: Drought Warning

**Situation:** Drought is coming, protect your crops

**Choices:**

1. **Invest in Drip Irrigation** → -300 coins, -1 crop
2. **Buy Water Rights (Short Term)** → -150 coins, -2 crops
3. **Do Nothing** → 0 coins, 0 crops (no change)

**Strategy:** Invest to save crops, or do nothing and keep everything as is.

---

## Scenario 4: Final Harvest

**Situation:** End of season, sell remaining crops

**Choices:**

1. **Sell Remaining Crops** → 0 coins, -all crops (crops become 0)

**Example:** If you have 5 crops left:

-   Sell Remaining Crops: 0 coins, -5 crops (you end with 0 crops)

---

## Calculations

### Simple Math:

-   All calculations use `Math.floor()` for half crops
-   Example: 8 crops ÷ 2 = 4 crops (not 4.5)
-   Example: 7 crops ÷ 2 = 3 crops (not 3.5)

### Scenario 2 "Sell Half" Example:

-   Team has 8 crops
-   Half = Math.floor(8 / 2) = 4 crops
-   Coins gained = 4 × 200 = 800 coins
-   Result: +800 coins, -4 crops

### Timer Bonus/Penalty:

-   Answer within time: **+50 coins bonus**
-   Answer after time expires: **-30 coins penalty**

### Final Score:

-   Total = Coins + (Crops × 50)
-   Example: 1000 coins + 5 crops = 1000 + 250 = 1250 points

---

## Display Logic

### Before Submission:

Shows the delta values in green (positive) or red (negative):

-   `Coins: +800` (green)
-   `Crops: -4` (red)

### After Submission:

Shows:

1. **Your Outcome:** The changes applied
2. **Your Farm After This Decision:** Current totals

---

## Key Points

-   **"Do Nothing"** options have NO effect (0 coins, 0 crops)
-   **"Sell Half"** gives 200 coins per crop sold
-   **"Sell Remaining Crops"** removes all crops but gives 0 coins
-   All calculations are simple and predictable
