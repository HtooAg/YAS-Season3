import type { Scenario } from "./types"

export const GAME_SCENARIOS: Scenario[] = [
  {
    id: "scenario-1",
    title: "Water Management Crisis",
    body: "A severe drought has hit the region. Water resources are limited. How will you manage your irrigation?",
    choices: [
      {
        id: "water-1",
        label: "Invest in drip irrigation",
        desc: "Costs 200 coins but saves water long-term",
        coinsDelta: -200,
        cropsDelta: 2,
      },
      {
        id: "water-2",
        label: "Continue traditional irrigation",
        desc: "No immediate cost but risk crop loss",
        coinsDelta: 0,
        cropsDelta: -1,
      },
      {
        id: "water-3",
        label: "Buy water from neighbors",
        desc: "Expensive but ensures crop survival",
        coinsDelta: -300,
        cropsDelta: 0,
      },
    ],
  },
  {
    id: "scenario-2",
    title: "Market Opportunity",
    body: "A large buyer wants to purchase crops immediately at a premium price. Do you sell now or wait for harvest?",
    choices: [
      {
        id: "market-1",
        label: "Sell crops now",
        desc: "Get 500 coins but lose 5 crops",
        coinsDelta: 500,
        cropsDelta: -5,
      },
      {
        id: "market-2",
        label: "Wait for full harvest",
        desc: "Risk market price drop but keep crops",
        coinsDelta: 100,
        cropsDelta: 3,
      },
      {
        id: "market-3",
        label: "Negotiate for better terms",
        desc: "Moderate gain with balanced trade-off",
        coinsDelta: 300,
        cropsDelta: -2,
      },
    ],
  },
  {
    id: "scenario-3",
    title: "Pest Infestation",
    body: "Your crops are under attack from pests. Quick action is needed to save the harvest.",
    choices: [
      {
        id: "pest-1",
        label: "Use organic pesticides",
        desc: "Costs 150 coins, minimal crop loss",
        coinsDelta: -150,
        cropsDelta: -1,
      },
      {
        id: "pest-2",
        label: "Use chemical pesticides",
        desc: "Costs 100 coins, faster but risky",
        coinsDelta: -100,
        cropsDelta: -2,
      },
      {
        id: "pest-3",
        label: "Manual pest removal",
        desc: "No cost but significant crop loss",
        coinsDelta: 0,
        cropsDelta: -4,
      },
    ],
  },
  {
    id: "scenario-4",
    title: "Technology Investment",
    body: "A new farming technology promises to increase yields. Should you invest in innovation?",
    choices: [
      {
        id: "tech-1",
        label: "Invest in new technology",
        desc: "High cost but long-term benefits",
        coinsDelta: -400,
        cropsDelta: 5,
      },
      {
        id: "tech-2",
        label: "Stick with traditional methods",
        desc: "No cost, steady but slow growth",
        coinsDelta: 0,
        cropsDelta: 1,
      },
      {
        id: "tech-3",
        label: "Partner with tech company",
        desc: "Share costs and benefits",
        coinsDelta: -200,
        cropsDelta: 3,
      },
    ],
  },
  {
    id: "scenario-5",
    title: "Final Harvest Decision",
    body: "The season is ending. How will you maximize your final harvest and profits?",
    choices: [
      {
        id: "harvest-1",
        label: "Harvest everything now",
        desc: "Guaranteed coins based on current crops",
        coinsDelta: 400,
        cropsDelta: 0,
      },
      {
        id: "harvest-2",
        label: "Wait for optimal ripeness",
        desc: "Risk weather but higher quality",
        coinsDelta: 600,
        cropsDelta: -3,
      },
      {
        id: "harvest-3",
        label: "Sell futures contracts",
        desc: "Lock in prices early",
        coinsDelta: 350,
        cropsDelta: 2,
      },
    ],
  },
]
