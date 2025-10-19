import { Storage } from "@google-cloud/storage";
import path from "path";

// Initialize Google Cloud Storage
// In production (Cloud Run), use default credentials (service account)
// In development, use key file if it exists
const storage = new Storage(
	process.env.NODE_ENV === "production"
		? { projectId: "yas-school" }
		: {
				keyFilename: path.join(process.cwd(), "gcs_key.json"),
				projectId: "yas-school",
		  }
);

const bucketName = "yas-data";
const bucket = storage.bucket(bucketName);

export interface AdminCredentials {
	username: string;
	password: string;
}

export interface TeamData {
	id: string;
	claimedBy?: string;
	name?: string;
	crop?: string;
	coins: number;
	crops: number;
	answers: Record<number, { choiceId: string; timestamp: number }>;
	notes?: string;
}

export interface GameData {
	phase: string;
	scenarioIndex: number;
	teams: Record<string, TeamData>;
	results?: {
		leaderboard: Array<{ id: string; total: number }>;
		winner?: string;
	};
	adminOnly: {
		requireAllReady: boolean;
		timerEnabled: boolean;
		timerDuration: number;
	};
	lastUpdate: number;
}

// Admin functions
export async function getAdminCredentials(): Promise<AdminCredentials | null> {
	try {
		const file = bucket.file("admin/admin.json");
		const [exists] = await file.exists();

		if (!exists) {
			return null;
		}

		const [contents] = await file.download();
		return JSON.parse(contents.toString());
	} catch (error) {
		console.error("Error getting admin credentials:", error);
		return null;
	}
}

export async function setAdminCredentials(
	credentials: AdminCredentials
): Promise<void> {
	const file = bucket.file("admin/admin.json");
	await file.save(JSON.stringify(credentials, null, 2), {
		contentType: "application/json",
	});
}

// Game state functions
export async function getGameState(): Promise<GameData | null> {
	try {
		const file = bucket.file("game/state.json");
		const [exists] = await file.exists();

		if (!exists) {
			return null;
		}

		const [contents] = await file.download();
		return JSON.parse(contents.toString());
	} catch (error) {
		console.error("Error getting game state:", error);
		return null;
	}
}

export async function saveGameState(gameData: GameData): Promise<void> {
	const file = bucket.file("game/state.json");
	await file.save(JSON.stringify(gameData, null, 2), {
		contentType: "application/json",
		metadata: {
			lastUpdate: new Date().toISOString(),
		},
	});
}

// Team functions
export async function getTeam(teamId: string): Promise<TeamData | null> {
	try {
		const file = bucket.file(`teams/${teamId}/data.json`);
		const [exists] = await file.exists();

		if (!exists) {
			return null;
		}

		const [contents] = await file.download();
		return JSON.parse(contents.toString());
	} catch (error) {
		console.error(`Error getting team ${teamId}:`, error);
		return null;
	}
}

export async function saveTeam(
	teamId: string,
	teamData: TeamData
): Promise<void> {
	const file = bucket.file(`teams/${teamId}/data.json`);
	await file.save(JSON.stringify(teamData, null, 2), {
		contentType: "application/json",
		metadata: {
			teamId,
			lastUpdate: new Date().toISOString(),
		},
	});
}

// Scenario answer functions
export async function saveScenarioAnswer(
	teamId: string,
	scenarioIndex: number,
	answer: { choiceId: string; timestamp: number }
): Promise<void> {
	const file = bucket.file(
		`teams/${teamId}/scenarios/scenario-${scenarioIndex}.json`
	);
	await file.save(JSON.stringify(answer, null, 2), {
		contentType: "application/json",
	});
}

// Reset game - delete all data
export async function resetGameData(): Promise<void> {
	try {
		// Delete all files in game folder
		const [gameFiles] = await bucket.getFiles({ prefix: "game/" });
		await Promise.all(gameFiles.map((file) => file.delete()));

		// Delete all files in teams folder
		const [teamFiles] = await bucket.getFiles({ prefix: "teams/" });
		await Promise.all(teamFiles.map((file) => file.delete()));
	} catch (error) {
		console.error("Error resetting game data:", error);
		throw error;
	}
}

// List all teams
export async function listTeams(): Promise<string[]> {
	try {
		const [files] = await bucket.getFiles({ prefix: "teams/" });
		const teamIds = new Set<string>();

		for (const file of files) {
			const match = file.name.match(/^teams\/([^/]+)\//);
			if (match) {
				teamIds.add(match[1]);
			}
		}

		return Array.from(teamIds);
	} catch (error) {
		console.error("Error listing teams:", error);
		return [];
	}
}
