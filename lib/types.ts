export type TeamId = "A" | "B" | "C";

export type TeamState = {
	id: TeamId;
	claimedBy?: string;
	name?: string;
	crop?: string;
	coins: number;
	crops: number;
	answers: Record<
		number,
		{
			choiceId: string;
			timestamp: number;
		}
	>;
	notes?: string;
};

export type Choice = {
	id: string;
	label: string;
	desc?: string;
	coinsDelta?: number;
	cropsDelta?: number;
	fx?: (team: TeamState) => {
		coinsDelta?: number;
		cropsDelta?: number;
		note?: string;
	};
};

export type Scenario = {
	id: string;
	title: string;
	body: string;
	choices: Choice[];
};

export type GamePhase = "lobby" | "running" | "finished";

export type GameState = {
	phase: GamePhase;
	scenarioIndex: number;
	scenarios: Scenario[];
	teams: Record<TeamId, TeamState>;
	results?: {
		leaderboard: Array<{ id: TeamId; total: number }>;
		winner?: TeamId;
		endedEarly?: boolean; // Flag to track if game was ended early
	};
	adminOnly: {
		requireAllReady: boolean;
		timerEnabled: boolean;
		timerDuration: number; // in seconds
		currentTimer?: {
			startTime: number;
			duration: number;
			scenarioIndex: number;
		};
	};
	lastUpdate: number;
};

export const CROPS = [
	"Dates & Citrus",
	"Tomatoes & Cucumbers",
	"Onions & Okra",
];

export const INITIAL_COINS = 1000;
export const INITIAL_CROPS = 10;
