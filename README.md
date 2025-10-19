# 🌾 YAS Harvest

A strategic agricultural decision-making game for teams. Make smart choices, manage resources, and harvest success together!

![YAS Harvest](public/YAS-logo.png)

### Player Setup

1. Visit `/player` or use the link from admin
2. Select a team (A, B, or C)
3. Enter team name and choose your crop
4. Wait for admin to start the game

## 🎯 How to Play

### For Players

-   **Claim Team**: Choose your team and crop type
-   **Answer Scenarios**: Make strategic decisions for each scenario
-   **Manage Resources**: Track your coins and crops
-   **Win**: Team with highest score (coins + crops × 50) wins!

### For Admin

-   **Lobby**: Wait for teams to join and ready up
-   **Timer** (Optional): Set time limits for scenarios
    -   ⚡ Bonus: +50 coins if completed within time
    -   ⚠️ Penalty: -30 coins if time exceeded
-   **Control Game**: Push scenarios and track team progress
-   **View Results**: See final leaderboard and winner

## 🚀 Installation

```bash
# Clone repository
git clone https://github.com/HtooAg/YAS-Harvest.git
cd YAS-Harvest

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 🛠️ Tech Stack

-   **Framework**: Next.js 15
-   **Styling**: Tailwind CSS
-   **Animations**: Framer Motion
-   **Real-time**: Socket.io
-   **UI Components**: Radix UI
-   **Notifications**: React Hot Toast

## 📱 Features

-   ✅ Real-time multiplayer sync
-   ✅ Admin authentication
-   ✅ Timer with penalties/bonuses
-   ✅ Responsive design (mobile & desktop)
-   ✅ Team notes and status tracking
-   ✅ Glassmorphism UI
-   ✅ Toast notifications
-   ✅ Game reset functionality

## 📋 Game Flow

```
1. Admin Login → 2. Teams Join → 3. Game Start
     ↓                ↓              ↓
4. Scenarios → 5. Teams Answer → 6. Results
     ↓                ↓              ↓
7. Winner Revealed → 8. Reset (Optional)
```

## 🌟 Key Features

### Timer System

-   Enable/disable timer per scenario
-   Set duration (10-300 seconds)
-   Automatic bonus/penalty calculation

### Team Management

-   3 teams (A, B, C)
-   Custom team names
-   Crop selection (Dates & Citrus, Tomatoes & Cucumbers, Onions & Okra)
-   Real-time status updates

### Scoring

-   Coins: Direct points from decisions
-   Crops: Worth 50 coins each
-   Final Score: Coins + (Crops × 50)

## 📞 Support

For issues or questions, contact the development team.

## 📄 License

© 2025 YAS School. All rights reserved.

---

**Built with ❤️ by John for YAS School**
