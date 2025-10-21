"use client";

import type React from "react";
import {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
} from "react";
import toast from "react-hot-toast";
import {
	type GameState,
	type TeamId,
	INITIAL_COINS,
	INITIAL_CROPS,
} from "./types";
import { GAME_SCENARIOS } from "./scenarios";
import { io, type Socket } from "socket.io-client";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const STORAGE_KEY = "yas-harvest-game-state";

const initialGameState: GameState = {
	phase: "lobby",
	scenarioIndex: -1,
	scenarios: GAME_SCENARIOS,
	teams: {
		A: { id: "A", coins: INITIAL_COINS, crops: INITIAL_CROPS, answers: {} },
		B: { id: "B", coins: INITIAL_COINS, crops: INITIAL_CROPS, answers: {} },
		C: { id: "C", coins: INITIAL_COINS, crops: INITIAL_CROPS, answers: {} },
	},
	adminOnly: {
		requireAllReady: true,
		timerEnabled: false,
		timerDuration: 60, // default 60 seconds
	},
	lastUpdate: Date.now(),
};

interface GameContextType {
	gameState: GameState;
	socket: Socket | null;
	claimTeam: (
		teamId: TeamId,
		clientId: string,
		name: string,
		crop: string
	) => Promise<boolean>;
	submitAnswer: (
		teamId: TeamId,
		scenarioIndex: number,
		choiceId: string
	) => void;
	submitTimePenalty: (teamId: TeamId, scenarioIndex: number) => void;
	startGame: () => void;
	nextScenario: () => void;
	showWinner: () => void;
	endGameEarly: () => void;
	resetGame: () => void;
	updateRequireAllReady: (value: boolean) => void;
	updateTimerSettings: (enabled: boolean, duration: number) => void;
	startTimer: (scenarioIndex: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
	const [gameState, setGameState] = useState<GameState>(initialGameState);
	const [socket, setSocket] = useState<Socket | null>(null);
	const [showResetDialog, setShowResetDialog] = useState(false);

	// Initialize socket connection
	useEffect(() => {
		const socketInstance = io({
			path: "/socket.io",
		});

		socketInstance.on("connect", () => {
			// Connected to WebSocket
		});

		socketInstance.on("game-state-changed", (data: GameState) => {
			setGameState(data);
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		});

		// All state updates now come through game-state-changed
		// These listeners are kept for backward compatibility but not used

		socketInstance.on("game-reset", () => {
			setGameState(initialGameState);
			localStorage.setItem(STORAGE_KEY, JSON.stringify(initialGameState));

			// Clear only game-related session storage (preserve admin auth)
			sessionStorage.removeItem("yas-harvest-client-id");
			sessionStorage.removeItem("yas-harvest-team-id");

			// Show reset dialog only to players (not admin)
			if (typeof window !== "undefined") {
				const currentPath = window.location.pathname;
				const isAdminPage = currentPath.startsWith("/admin");
				if (!isAdminPage) {
					setShowResetDialog(true);
				}
			}
		});

		setSocket(socketInstance);

		return () => {
			socketInstance.disconnect();
		};
	}, []);

	// Load from localStorage on mount (WebSocket will sync the rest)
	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				const data = JSON.parse(stored);
				setGameState(data);
			} catch (e) {
				console.error("Failed to parse stored game state", e);
				// If localStorage is corrupted, start fresh
				setGameState(initialGameState);
			}
		} else {
			setGameState(initialGameState);
		}
	}, []);

	// BroadcastChannel disabled - WebSocket handles all sync
	// (BroadcastChannel was causing infinite loops)

	const updateState = useCallback(
		async (newState: GameState) => {
			const updatedState = { ...newState, lastUpdate: Date.now() };
			setGameState(updatedState);
			localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));

			// Save to GCS
			try {
				await fetch("/api/game", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(updatedState),
				});
			} catch (error) {
				console.error("Failed to save game state to GCS", error);
			}

			// Emit to WebSocket - this will broadcast to all clients
			if (socket) {
				socket.emit("game-state-update", updatedState);
			}
		},
		[socket]
	);

	const claimTeam = useCallback(
		async (
			teamId: TeamId,
			clientId: string,
			name: string,
			crop: string
		): Promise<boolean> => {
			// Get fresh state
			let currentState: GameState;
			setGameState((prevState) => {
				currentState = prevState;
				return prevState;
			});

			const team = currentState!.teams[teamId];
			if (team.claimedBy && team.claimedBy !== clientId) {
				toast.error(`Team ${teamId} is already claimed!`);
				return false; // Already claimed by someone else
			}

			const updatedTeam = {
				...team,
				claimedBy: clientId,
				name,
				crop,
			};

			// Save team to GCS
			try {
				await fetch(`/api/teams/${teamId}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(updatedTeam),
				});
			} catch (error) {
				console.error("Failed to save team to GCS", error);
			}

			const newState = {
				...currentState!,
				teams: {
					...currentState!.teams,
					[teamId]: updatedTeam,
				},
			};

			await updateState(newState);

			// Store in sessionStorage
			sessionStorage.setItem("yas-harvest-client-id", clientId);
			sessionStorage.setItem("yas-harvest-team-id", teamId);

			toast.success(
				`Team ${teamId} claimed successfully! Welcome ${name}!`
			);
			return true;
		},
		[updateState]
	);

	const submitAnswer = useCallback(
		async (teamId: TeamId, scenarioIndex: number, choiceId: string) => {
			// Get fresh state
			let currentState: GameState;
			setGameState((prevState) => {
				currentState = prevState;
				return prevState;
			});

			const team = currentState!.teams[teamId];
			// IMPORTANT: Use GAME_SCENARIOS from code, not from state
			// State scenarios lose functions when serialized to JSON/GCS
			const scenario = GAME_SCENARIOS[scenarioIndex];
			const choice = scenario.choices.find((c) => c.id === choiceId);

			if (!choice) return;

			// Calculate deltas - simple and straightforward
			let coinsDelta =
				typeof choice.coinsDelta === "function"
					? choice.coinsDelta(team)
					: choice.coinsDelta || 0;

			let cropsDelta =
				typeof choice.cropsDelta === "function"
					? choice.cropsDelta(team)
					: choice.cropsDelta || 0;

			// Apply timer bonus/penalty
			let timerBonus = 0;
			let timerPenalty = 0;

			if (
				currentState!.adminOnly.timerEnabled &&
				currentState!.adminOnly.currentTimer
			) {
				const timer = currentState!.adminOnly.currentTimer;
				const elapsed = Date.now() - timer.startTime;
				const remaining = Math.max(0, timer.duration * 1000 - elapsed);
				const secondsRemaining = Math.ceil(remaining / 1000);

				if (secondsRemaining > 0) {
					// Completed within time - bonus
					timerBonus = 50;
					coinsDelta += timerBonus;
				} else {
					// Exceeded time - penalty
					timerPenalty = -30;
					coinsDelta += timerPenalty;
				}
			}

			// Store the answer with outcome
			const newAnswers = {
				...team.answers,
				[scenarioIndex]: {
					choiceId,
					timestamp: Date.now(),
					outcome: {
						coinsDelta,
						cropsDelta,
						timerBonus: timerBonus || undefined,
						timerPenalty: timerPenalty || undefined,
					},
				},
			};

			// Update team resources
			const updatedTeam = {
				...team,
				coins: team.coins + coinsDelta,
				crops: team.crops + cropsDelta,
				answers: newAnswers,
			};

			// Save to backend
			try {
				await fetch(`/api/teams/${teamId}/answer`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ scenarioIndex, choiceId }),
				});

				await fetch(`/api/teams/${teamId}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(updatedTeam),
				});
			} catch (error) {
				console.error("Failed to save answer to GCS", error);
			}

			// Update game state
			const newState = {
				...currentState!,
				teams: {
					...currentState!.teams,
					[teamId]: updatedTeam,
				},
			};

			await updateState(newState);

			// Show success message
			const timerMsg =
				timerBonus > 0
					? " ⚡ +50 bonus!"
					: timerPenalty < 0
					? " ⚠️ -30 penalty!"
					: "";
			toast.success(
				`Answer submitted! ${
					coinsDelta >= 0 ? "+" : ""
				}${coinsDelta} coins, ${
					cropsDelta >= 0 ? "+" : ""
				}${cropsDelta} crops${timerMsg}`,
				{ duration: 4000 }
			);
		},
		[updateState]
	);

	const submitTimePenalty = useCallback(
		async (teamId: TeamId, scenarioIndex: number) => {
			// Get fresh state
			let currentState: GameState;
			setGameState((prevState) => {
				currentState = prevState;
				return prevState;
			});

			const team = currentState!.teams[teamId];

			// Only apply -30 coins penalty, no choice effects
			const coinsDelta = -30;
			const cropsDelta = 0;

			const newAnswers = {
				...team.answers,
				[scenarioIndex]: {
					choiceId: "TIME_PENALTY_ONLY",
					timestamp: Date.now(),
					outcome: {
						coinsDelta,
						cropsDelta,
						timerPenalty: -30,
					},
				},
			};

			const updatedTeam = {
				...team,
				coins: team.coins + coinsDelta,
				crops: team.crops + cropsDelta,
				answers: newAnswers,
			};

			// Save answer to GCS
			try {
				await fetch(`/api/teams/${teamId}/answer`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						scenarioIndex,
						choiceId: "TIME_PENALTY_ONLY",
					}),
				});

				// Update team in GCS
				await fetch(`/api/teams/${teamId}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(updatedTeam),
				});
			} catch (error) {
				console.error("Failed to save penalty to GCS", error);
			}

			const newState = {
				...currentState!,
				teams: {
					...currentState!.teams,
					[teamId]: updatedTeam,
				},
			};

			await updateState(newState);

			toast.error(
				"⏰ Time's up! No answer selected. -30 coins penalty applied!",
				{ duration: 5000 }
			);
		},
		[updateState]
	);

	const startGame = useCallback(async () => {
		console.log("[GameContext] Starting game...");

		// Get fresh state
		let currentState: GameState;
		setGameState((prevState) => {
			currentState = prevState;
			return prevState;
		});

		const newState = {
			...currentState!,
			phase: "running" as const,
			scenarioIndex: 0,
			adminOnly: {
				...currentState!.adminOnly,
				currentTimer:
					currentState!.adminOnly &&
					currentState!.adminOnly.timerEnabled
						? {
								startTime: Date.now(),
								duration: currentState!.adminOnly.timerDuration,
								scenarioIndex: 0,
						  }
						: undefined,
			},
			lastUpdate: Date.now(),
		};

		await updateState(newState);
		toast.success("Game started! Good luck to all teams!");
	}, [updateState]);

	const nextScenario = useCallback(async () => {
		// Get fresh state
		let currentState: GameState;
		setGameState((prevState) => {
			currentState = prevState;
			return prevState;
		});

		const nextIndex = currentState!.scenarioIndex + 1;

		if (nextIndex >= currentState!.scenarios.length) {
			// Game finished - calculate results
			const leaderboard = Object.values(currentState!.teams)
				.filter((t) => t.claimedBy)
				.map((t) => ({
					id: t.id,
					total: t.coins + t.crops * 50,
				}))
				.sort((a, b) => b.total - a.total);

			const newState = {
				...currentState!,
				phase: "finished" as const,
				results: {
					leaderboard,
					winner: leaderboard[0]?.id,
				},
				lastUpdate: Date.now(),
			};

			await updateState(newState);
			toast.success("Game finished! Check the final results!");
		} else {
			// Start timer for new scenario if enabled
			const newState = {
				...currentState!,
				scenarioIndex: nextIndex,
				adminOnly: {
					...currentState!.adminOnly,
					currentTimer:
						currentState!.adminOnly &&
						currentState!.adminOnly.timerEnabled
							? {
									startTime: Date.now(),
									duration:
										currentState!.adminOnly.timerDuration,
									scenarioIndex: nextIndex,
							  }
							: undefined,
				},
				lastUpdate: Date.now(),
			};

			await updateState(newState);
			toast.success(`Moving to scenario ${nextIndex + 1}`);
		}
	}, [updateState]);

	const showWinner = useCallback(() => {
		// Winner is already shown in gameState.results
		// No need to emit, state is already synchronized
		toast.success("Winner revealed to all players!");
	}, []);

	const endGameEarly = useCallback(async () => {
		// Get fresh state
		let currentState: GameState;
		setGameState((prevState) => {
			currentState = prevState;
			return prevState;
		});

		// Calculate results based on current state
		const leaderboard = Object.values(currentState!.teams)
			.filter((t) => t.claimedBy)
			.map((t) => ({
				id: t.id,
				total: t.coins + t.crops * 50,
			}))
			.sort((a, b) => b.total - a.total);

		const newState = {
			...currentState!,
			phase: "finished" as const,
			results: {
				leaderboard,
				winner: leaderboard[0]?.id,
				endedEarly: true, // Mark that game was ended early
			},
			lastUpdate: Date.now(),
		};

		await updateState(newState);
		toast.success("Game ended! Showing final results to all players.");
	}, [updateState]);

	const resetGame = useCallback(async () => {
		// Reset in GCS
		try {
			await fetch("/api/game", {
				method: "DELETE",
			});
		} catch (error) {
			console.error("Failed to reset game in GCS", error);
		}

		await updateState(initialGameState);

		// Clear only game-related session storage (preserve admin auth)
		sessionStorage.removeItem("yas-harvest-client-id");
		sessionStorage.removeItem("yas-harvest-team-id");

		if (socket) {
			socket.emit("reset-game");
		}

		toast.success("Game reset successfully! Starting fresh...");
	}, [socket, updateState]);

	const updateRequireAllReady = useCallback(
		(value: boolean) => {
			// Use functional update to get latest state
			setGameState((prevState) => {
				const newState = {
					...prevState,
					adminOnly: {
						...prevState.adminOnly,
						requireAllReady: value,
					},
					lastUpdate: Date.now(),
				};

				// Save to GCS and broadcast
				localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));

				// Save to GCS
				fetch("/api/game", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(newState),
				}).catch((error) => {
					console.error("Failed to save game state to GCS", error);
				});

				// Broadcast to other tabs
				const channel = new BroadcastChannel("yas-harvest-sync");
				channel.postMessage({ type: "state-update", state: newState });
				channel.close();

				// Emit to WebSocket
				if (socket) {
					socket.emit("game-state-update", newState);
				}

				return newState;
			});
		},
		[socket]
	);

	const updateTimerSettings = useCallback(
		(enabled: boolean, duration: number) => {
			// Use functional update to get latest state
			setGameState((prevState) => {
				const newState = {
					...prevState,
					adminOnly: {
						...prevState.adminOnly,
						timerEnabled: enabled,
						timerDuration: duration,
					},
					lastUpdate: Date.now(),
				};

				// Save to GCS and broadcast
				localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));

				// Save to GCS
				fetch("/api/game", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(newState),
				}).catch((error) => {
					console.error("Failed to save game state to GCS", error);
				});

				// Broadcast to other tabs
				const channel = new BroadcastChannel("yas-harvest-sync");
				channel.postMessage({ type: "state-update", state: newState });
				channel.close();

				// Emit to WebSocket
				if (socket) {
					socket.emit("game-state-update", newState);
				}

				return newState;
			});

			toast.success(
				enabled
					? `Timer enabled: ${duration} seconds per scenario`
					: "Timer disabled"
			);
		},
		[socket]
	);

	const startTimer = useCallback(
		(scenarioIndex: number) => {
			// Get fresh state
			let currentState: GameState;
			setGameState((prevState) => {
				currentState = prevState;
				return prevState;
			});

			if (!currentState!.adminOnly.timerEnabled) return;

			const newState = {
				...currentState!,
				adminOnly: {
					...currentState!.adminOnly,
					currentTimer: {
						startTime: Date.now(),
						duration: currentState!.adminOnly.timerDuration,
						scenarioIndex,
					},
				},
			};
			updateState(newState);
		},
		[updateState]
	);

	const handleResetDialogClose = () => {
		setShowResetDialog(false);
		// Redirect to player page if on other pages
		if (typeof window !== "undefined") {
			const currentPath = window.location.pathname;
			if (
				currentPath.startsWith("/player/") &&
				currentPath !== "/player"
			) {
				window.location.href = "/player";
			}
		}
	};

	return (
		<>
			<GameContext.Provider
				value={{
					gameState,
					socket,
					claimTeam,
					submitAnswer,
					submitTimePenalty,
					startGame,
					nextScenario,
					showWinner,
					endGameEarly,
					resetGame,
					updateRequireAllReady,
					updateTimerSettings,
					startTimer,
				}}
			>
				{children}
			</GameContext.Provider>

			{/* Global Reset Dialog */}
			<AlertDialog
				open={showResetDialog}
				onOpenChange={setShowResetDialog}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="text-2xl font-bold text-[#4A8B8B]">
							🔄 Game Reset
						</AlertDialogTitle>
						<AlertDialogDescription asChild>
							<div className="space-y-3">
								<div className="text-lg font-semibold text-slate-900">
									The admin has reset the game.
								</div>
								<div className="text-slate-700">
									All game data has been cleared and the game
									has returned to the lobby. You will need to
									claim a team again to continue playing.
								</div>
							</div>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogAction
							onClick={handleResetDialogClose}
							className="bg-[#4A8B8B] hover:bg-[#3A7575] text-white"
						>
							OK, Got It
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

export function useGame() {
	const context = useContext(GameContext);
	if (!context) {
		throw new Error("useGame must be used within GameProvider");
	}
	return context;
}
