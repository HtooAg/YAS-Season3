import type { Scenario } from "./types";

export const GAME_SCENARIOS: Scenario[] = [
	{
		id: "scenario-1",
		title: "Pest Outbreak Spreading",
		body: "An aggressive pest infestation has been detected in nearby fields and is rapidly approaching your farm. Experts warn that without intervention, the damage could be catastrophic.",
		choices: [
			{
				id: "pest-1-a",
				label: "Buy Pesticide",
				desc: "Spend 200 coins to save most crops",
				coinsDelta: -200,
				cropsDelta: -1,
			},
			{
				id: "pest-1-b",
				label: "Natural Remedy",
				desc: "Spend 50 coins but lose more crops",
				coinsDelta: -50,
				cropsDelta: -2,
			},
			{
				id: "pest-1-c",
				label: "Do Nothing",
				desc: "No cost, no change to your farm",
				coinsDelta: 0,
				cropsDelta: 0,
			},
		],
	},
	{
		id: "scenario-2",
		title: "Market Opportunity",
		body: "Luxury restaurants from the city have arrived at the local market offering 2× the normal price for fresh produce. This is a rare opportunity, but the market is unpredictable. Will prices go even higher, or is this the peak?",
		choices: [
			{
				id: "market-2-a",
				label: "Sell Half",
				desc: "Sell half your crops for 200 coins each",
				coinsDelta: (team) => Math.floor(team.crops / 2) * 200,
				cropsDelta: (team) => -Math.floor(team.crops / 2),
			},
			{
				id: "market-2-c",
				label: "Keep All",
				desc: "Don't sell, keep your crops",
				coinsDelta: 0,
				cropsDelta: 0,
			},
		],
	},
	{
		id: "scenario-3",
		title: "Drought Warning",
		body: "A drought is coming. You need water to protect your crops.",
		choices: [
			{
				id: "drought-3-a",
				label: "Invest in Drip Irrigation",
				desc: "Spend 300 coins to save crops",
				coinsDelta: -300,
				cropsDelta: -1,
			},
			{
				id: "drought-3-b",
				label: "Buy Water Rights (Short Term)",
				desc: "Spend 150 coins for temporary water",
				coinsDelta: -150,
				cropsDelta: -2,
			},
			{
				id: "drought-3-c",
				label: "Do Nothing",
				desc: "No cost, no change to your farm",
				coinsDelta: 0,
				cropsDelta: 0,
			},
		],
	},
	{
		id: "scenario-4",
		title: "Final Harvest",
		body: "It's the end of the season. Time to sell your remaining crops.",
		choices: [
			{
				id: "harvest-4-a",
				label: "Sell Remaining Crops",
				desc: "Sell all remaining crops (no coins gained, crops become 0)",
				coinsDelta: 0,
				cropsDelta: (team) => -team.crops,
			},
		],
	},
];
