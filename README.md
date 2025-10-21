# 🌾 YAS Harvest - Interactive Farm Management Game

An engaging multiplayer game designed for educational workshops and team-building activities. Players manage virtual farms, make strategic decisions, and compete for the highest score through 4 challenging scenarios.

![YAS Harvest](public/YAS-logo.png)

## 🎮 Game Overview

YAS Harvest is a real-time multiplayer game where teams manage farms, make critical decisions about resource allocation, and compete to achieve the highest score. Perfect for teaching decision-making, risk management, and strategic thinking.

### Key Features

-   🎯 **4 Unique Scenarios** - Each with different challenges and outcomes
-   👥 **3 Teams** - Compete simultaneously in real-time
-   ⏱️ **Optional Timer** - Add pressure with countdown timers
-   📊 **Live Leaderboard** - Track scores in real-time
-   🎨 **Beautiful UI** - Modern, responsive design with animations
-   🔄 **WebSocket Sync** - Real-time updates across all devices
-   📱 **Mobile Friendly** - Works on phones, tablets, and desktops

---

## 🚀 Quick Start

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/HtooAg/yas-harvest.git
cd yas-harvest
```

2. **Install dependencies**

```bash
npm install
```

3. **Run the development server**

```bash
npm run dev
```

4. **Open in browser**

-  `http://localhost:3000/player`

---

## 🎲 How to Play

### For Players

1. **Join game** at `/player`
2. **Claim a team** (A, B, or C)
3. **Enter team name** and choose crop type
4. **Wait for game** to start
5. **Make decisions** for each scenario
6. **View results** and final standings

---

## 📋 Game Scenarios

### Scenario 1: Pest Outbreak

Pests are attacking! Choose how to protect your crops:

-   **Buy Pesticide** (-200 coins, -1 crop)
-   **Natural Remedy** (-50 coins, -2 crops)
-   **Do Nothing** (0 coins, 0 crops)

### Scenario 2: Market Opportunity

High prices today! Decide what to sell:

-   **Sell Half** (+coins, -half crops)
-   **Sell All** (+coins, -all crops)
-   **Keep All** (no change)

### Scenario 3: Drought Warning

Drought is coming! Protect your farm:

-   **Buy Irrigation** (-300 coins, -1 crop)
-   **Buy Water** (-150 coins, -2 crops)
-   **Do Nothing** (0 coins, 0 crops)

### Scenario 4: Final Harvest

End of season - sell remaining crops:

-   **Sell Remaining Crops** (0 coins, -all crops)

---


## 🛠️ Technology Stack

### Frontend

-   **Next.js 14** - React framework
-   **TypeScript** - Type safety
-   **Tailwind CSS** - Styling
-   **Framer Motion** - Animations
-   **Shadcn/ui** - UI components

### Backend

-   **Node.js** - Runtime
-   **Socket.io** - Real-time communication
-   **Google Cloud Storage** - State persistence

### Deployment

-   **Docker** - Containerization
-   **Google Cloud Run** - Hosting

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

-   **YAS Team** - Initial work and design

---

## 📞 Support

For support, htoow243@gmail.com or open an issue on GitHub.

---

Made with ❤️ by Htoo Aung Wai - John (Software Developer & UI/UX Designer)
