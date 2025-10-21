# Quick Reference Guide

## Scenario Calculations

### Scenario 1: Pest Outbreak Spreading

| Choice         | Coins | Crops |
| -------------- | ----- | ----- |
| Buy Pesticide  | -200  | -1    |
| Natural Remedy | -50   | -2    |
| Do Nothing     | 0     | 0     |

### Scenario 2: Market Opportunity (200 coins per crop)

| Choice    | Coins          | Crops      |
| --------- | -------------- | ---------- |
| Sell Half | +(crops÷2)×200 | -(crops÷2) |
| Keep All  | 0              | 0          |

**Example with 8 crops:**

-   Sell Half: +800 coins, -4 crops
-   Keep All: no change

### Scenario 3: Drought Warning

| Choice                        | Coins | Crops |
| ----------------------------- | ----- | ----- |
| Invest in Drip Irrigation     | -300  | -1    |
| Buy Water Rights (Short Term) | -150  | -2    |
| Do Nothing                    | 0     | 0     |

### Scenario 4: Final Harvest

| Choice               | Coins | Crops  |
| -------------------- | ----- | ------ |
| Sell Remaining Crops | 0     | -crops |

**Example with 5 crops:**

-   Sell Remaining Crops: 0 coins, -5 crops (you end with 0 crops)

---

## Timer System

| Timing             | Effect            |
| ------------------ | ----------------- |
| Answer within time | +50 coins bonus   |
| Answer after time  | -30 coins penalty |
| No answer selected | -30 coins penalty |

---

## Scoring

**Final Score = Coins + (Crops × 50)**

Examples:

-   1000 coins + 10 crops = 1000 + 500 = **1500 points**
-   1500 coins + 5 crops = 1500 + 250 = **1750 points**
-   2000 coins + 0 crops = 2000 + 0 = **2000 points**

---

## Starting Resources

-   **Coins:** 1000
-   **Crops:** 10

---

## Key Calculations

### Sell Half (Scenario 2):

```typescript
// For team with 8 crops
halfCrops = Math.floor(8 / 2) = 4
coinsGained = 4 × 200 = 800
cropsSold = -4

Result: +800 coins, -4 crops
```

### Do Nothing (All Scenarios):

```typescript
// No effect at all
coinsDelta = 0
cropsDelta = 0

Result: No change to coins or crops
```

---

## Display Colors

-   **Green text:** Positive values (+800, +2)
-   **Red text:** Negative values (-200, -4)
-   **Bold:** All delta values are bold for visibility

---

## Important Notes

1. **"Do Nothing"** means NO change (0 coins, 0 crops)
2. **"Sell Half"** gives 200 coins per crop
3. **"Sell Remaining Crops"** removes crops but gives 0 coins
4. All calculations use `Math.floor()` for rounding down
