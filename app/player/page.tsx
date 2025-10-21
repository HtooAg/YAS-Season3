"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/lib/game-context";
import { type TeamId, CROPS } from "@/lib/types";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/navbar-responsive";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Coins,
	Sprout,
	Clock,
	CheckCircle2,
	Users,
	Leaf,
	AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function PlayerPage() {
	const router = useRouter();
	const { gameState, claimTeam, submitAnswer } = useGame();
	const [clientId, setClientId] = useState<string>("");
	const [myTeamId, setMyTeamId] = useState<TeamId | null>(null);
	const [teamName, setTeamName] = useState("");
	const [selectedCrop, setSelectedCrop] = useState("");
	const [selectedTeam, setSelectedTeam] = useState<TeamId | null>(null);
	const [error, setError] = useState("");
	const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

	// Redirect to appropriate page based on game state and team claim
	useEffect(() => {
		if (myTeamId) {
			if (gameState.phase === "lobby") {
				router.push("/player/pending");
			} else if (
				gameState.phase === "running" &&
				gameState.scenarioIndex >= 0
			) {
				router.push("/player/scenario");
			} else if (gameState.phase === "finished") {
				router.push("/player/results");
			}
		}
	}, [myTeamId, gameState.phase, gameState.scenarioIndex, router]);

	useEffect(() => {
		// Get or create client ID
		let id = sessionStorage.getItem("yas-harvest-client-id");
		if (!id) {
			id = `player-${Date.now()}-${Math.random()
				.toString(36)
				.substr(2, 9)}`;
			sessionStorage.setItem("yas-harvest-client-id", id);
		}
		setClientId(id);

		// Check if already claimed a team
		const savedTeamId = sessionStorage.getItem(
			"yas-harvest-team-id"
		) as TeamId | null;
		if (savedTeamId) {
			setMyTeamId(savedTeamId);
		}
	}, []);

	// Reset team when game is reset (phase goes back to lobby and all teams are unclaimed)
	useEffect(() => {
		if (gameState.phase === "lobby" && myTeamId && gameState.teams) {
			const myTeam = gameState.teams[myTeamId];
			// If the team is no longer claimed, reset the player's team
			if (myTeam && !myTeam.claimedBy) {
				setMyTeamId(null);
				sessionStorage.removeItem("yas-harvest-team-id");
				// No toast notification - just silently reset
			}
		}
	}, [gameState.phase, gameState.teams, myTeamId]);

	const handleClaimTeam = async () => {
		if (!selectedTeam || !teamName || !selectedCrop) {
			setError("Please fill in all fields");
			return;
		}

		const success = await claimTeam(
			selectedTeam,
			clientId,
			teamName,
			selectedCrop
		);
		if (success) {
			setMyTeamId(selectedTeam);
			setError("");
		} else {
			setError("Team already taken—choose another");
		}
	};

	const handleSubmitAnswer = () => {
		if (!myTeamId || !selectedChoice) return;

		submitAnswer(myTeamId, gameState.scenarioIndex, selectedChoice);
		setSelectedChoice(null);
	};

	const myTeam =
		myTeamId && gameState.teams ? gameState.teams[myTeamId] : null;
	const currentScenario =
		gameState.scenarioIndex >= 0 && gameState.scenarios
			? gameState.scenarios[gameState.scenarioIndex]
			: null;
	const hasAnswered =
		myTeam && currentScenario && myTeam.answers
			? !!myTeam.answers[gameState.scenarioIndex]
			: false;

	// Timer state
	const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
	const [showTimeWarning, setShowTimeWarning] = useState(false);
	const [timePenaltyApplied, setTimePenaltyApplied] = useState(false);
	const [showRulesAlert, setShowRulesAlert] = useState(false);

	// Calculate outcome after answer
	const [outcome, setOutcome] = useState<{
		coinsDelta: number;
		cropsDelta: number;
		timerBonus?: number;
		timerPenalty?: number;
	} | null>(null);

	// Timer countdown effect
	useEffect(() => {
		if (
			gameState.phase === "running" &&
			gameState.adminOnly &&
			gameState.adminOnly.timerEnabled &&
			gameState.adminOnly.currentTimer &&
			!hasAnswered
		) {
			const timer = gameState.adminOnly.currentTimer;
			const elapsed = Date.now() - timer.startTime;
			const remaining = Math.max(0, timer.duration * 1000 - elapsed);

			setTimeRemaining(Math.ceil(remaining / 1000));

			const interval = setInterval(() => {
				const newElapsed = Date.now() - timer.startTime;
				const newRemaining = Math.max(
					0,
					timer.duration * 1000 - newElapsed
				);
				const seconds = Math.ceil(newRemaining / 1000);

				setTimeRemaining(seconds);

				// Show warning at 10 seconds
				if (seconds <= 10 && seconds > 0 && !showTimeWarning) {
					setShowTimeWarning(true);
				}

				// Time expired - show rules alert
				if (seconds === 0 && !timePenaltyApplied && !showRulesAlert) {
					setShowRulesAlert(true);
					setTimePenaltyApplied(true);
					toast.error(
						"⏰ Time's up! -30 coins penalty for exceeding time limit!",
						{ duration: 5000 }
					);
				}
			}, 100);

			return () => clearInterval(interval);
		} else {
			setTimeRemaining(null);
			setShowTimeWarning(false);
		}
	}, [
		gameState.phase,
		gameState.adminOnly,
		hasAnswered,
		showTimeWarning,
		timePenaltyApplied,
		showRulesAlert,
	]);

	// Calculate outcome when answer is submitted
	useEffect(() => {
		if (hasAnswered && currentScenario && myTeam) {
			const answer = myTeam.answers[gameState.scenarioIndex];
			const choice = currentScenario.choices.find(
				(c) => c.id === answer.choiceId
			);

			if (choice) {
				let coinsDelta =
					typeof choice.coinsDelta === "function" && myTeam
						? choice.coinsDelta(myTeam)
						: typeof choice.coinsDelta === "number"
						? choice.coinsDelta
						: 0;
				let cropsDelta =
					typeof choice.cropsDelta === "function" && myTeam
						? choice.cropsDelta(myTeam)
						: typeof choice.cropsDelta === "number"
						? choice.cropsDelta
						: 0;
				let timerBonus = 0;
				let timerPenalty = 0;

				// Apply timer bonus/penalty
				if (gameState.adminOnly && gameState.adminOnly.timerEnabled) {
					if (timeRemaining !== null && timeRemaining > 0) {
						// Completed within time - bonus
						timerBonus = 50;
						coinsDelta += timerBonus;
					} else if (timePenaltyApplied) {
						// Exceeded time - penalty
						timerPenalty = -30;
						coinsDelta += timerPenalty;
					}
				}

				setOutcome({
					coinsDelta,
					cropsDelta,
					timerBonus,
					timerPenalty,
				});
			}
		} else {
			setOutcome(null);
		}
	}, [
		hasAnswered,
		currentScenario,
		myTeam,
		gameState.scenarioIndex,
		gameState.adminOnly,
		timeRemaining,
		timePenaltyApplied,
	]);

	// Reset timer states and selected choice when scenario changes
	useEffect(() => {
		setTimePenaltyApplied(false);
		setShowRulesAlert(false);
		setShowTimeWarning(false);
		setSelectedChoice(null); // Reset selected choice for new scenario
	}, [gameState.scenarioIndex]);

	// Team claiming view
	if (!myTeamId) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
				<Navbar />
				<div className="max-w-4xl mx-auto p-4 md:p-8">
					{/* Team Selection */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
					>
						<Card>
							<CardHeader>
								<CardTitle>Claim Your Team</CardTitle>
								<CardDescription>
									Select a team and enter your details to join
									the game
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Team Selection */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									{(["A", "B", "C"] as TeamId[]).map(
										(teamId) => {
											const team =
												gameState.teams[teamId];
											const isClaimed = !!team.claimedBy;
											return (
												<button
													key={teamId}
													onClick={() =>
														!isClaimed &&
														setSelectedTeam(teamId)
													}
													disabled={isClaimed}
													className={`p-6 rounded-lg border-2 transition-all ${
														selectedTeam === teamId
															? "border-[#4A8B8B] bg-[#4A8B8B]/10"
															: isClaimed
															? "border-slate-200 bg-slate-100 opacity-50 cursor-not-allowed"
															: "border-slate-200 hover:border-[#4A8B8B] hover:bg-[#4A8B8B]/5"
													}`}
												>
													<div className="text-2xl font-bold text-slate-900 mb-2">
														Team {teamId}
													</div>
													{isClaimed ? (
														<div className="text-sm text-slate-500">
															Already Claimed
														</div>
													) : (
														<div className="text-sm text-[#4A8B8B]">
															Available
														</div>
													)}
												</button>
											);
										}
									)}
								</div>

								{/* Team Name */}
								<div className="space-y-2">
									<Label htmlFor="team-name">Team Name</Label>
									<Input
										id="team-name"
										placeholder="Enter your team name"
										value={teamName}
										onChange={(e) =>
											setTeamName(e.target.value)
										}
									/>
								</div>

								{/* Crop Selection */}
								<div className="space-y-2">
									<Label htmlFor="crop">Select Crop</Label>
									<Select
										value={selectedCrop}
										onValueChange={setSelectedCrop}
									>
										<SelectTrigger id="crop">
											<SelectValue placeholder="Choose your crop" />
										</SelectTrigger>
										<SelectContent>
											{CROPS.map((crop) => (
												<SelectItem
													key={crop}
													value={crop}
												>
													{crop}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								{/* Error Message */}
								{error && (
									<Alert variant="destructive">
										<AlertDescription>
											{error}
										</AlertDescription>
									</Alert>
								)}

								<Button
									onClick={handleClaimTeam}
									disabled={
										!selectedTeam ||
										!teamName ||
										!selectedCrop
									}
									className="w-full bg-[#4A8B8B] hover:bg-[#3A7575] text-white"
									size="lg"
								>
									Claim Team
								</Button>
							</CardContent>
						</Card>
					</motion.div>
				</div>
			</div>
		);
	}

	// Waiting for game to start (if player has claimed a team and game hasn't started)
	if (
		myTeamId &&
		gameState.phase !== "running" &&
		gameState.phase !== "finished"
	) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
				<div className="max-w-3xl mx-auto">
					{/* Team Header */}
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-center mb-8 mt-4"
					>
						<h1 className="text-3xl md:text-4xl font-bold text-slate-800">
							Team {myTeam?.id}
						</h1>
					</motion.div>

					{/* Team Info Card */}
					<Card className="mb-6">
						<CardContent className="pt-4 space-y-3">
							{/* Team Name */}
							<div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
								<span className="text-base font-semibold text-slate-700 flex items-center gap-2">
									<Users className="w-4 h-4 text-[#4A8B8B]" />
									Team Name:
								</span>
								<span className="text-base font-bold text-slate-900">
									{myTeam?.name || teamName || "Loading..."}
								</span>
							</div>

							{/* Crop */}
							<div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
								<span className="text-base font-semibold text-slate-700 flex items-center gap-2">
									<Leaf className="w-4 h-4 text-green-600" />
									Crop:
								</span>
								<span className="text-base font-bold text-slate-900">
									{myTeam?.crop ||
										selectedCrop ||
										"Loading..."}
								</span>
							</div>

							{/* Starting Coins */}
							<div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
								<span className="text-base font-semibold text-slate-700 flex items-center gap-2">
									<Coins className="w-4 h-4 text-[#4A8B8B]" />
									Starting Coins:
								</span>
								<div className="flex items-center gap-2">
									<span className="text-xl font-bold text-[#4A8B8B] bg-[#4A8B8B]/10 px-3 py-1 rounded-full">
										{myTeam?.coins ?? 1000}
									</span>
								</div>
							</div>

							{/* Starting Crops */}
							<div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
								<span className="text-base font-semibold text-slate-700 flex items-center gap-2">
									<Sprout className="w-4 h-4 text-green-600" />
									Starting Crops:
								</span>
								<div className="flex items-center gap-2">
									<span className="text-xl font-bold text-[#4A8B8B] bg-[#4A8B8B]/10 px-3 py-1 rounded-full">
										{myTeam?.crops ?? 10}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Waiting Message */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
						className="text-center py-8"
					>
						<motion.div
							animate={{ rotate: 360 }}
							transition={{
								duration: 2,
								repeat: Number.POSITIVE_INFINITY,
								ease: "linear",
							}}
							className="inline-block mb-4"
						>
							<Clock className="w-12 h-12 text-[#4A8B8B]" />
						</motion.div>
						<h2 className="text-xl font-bold text-slate-900 mb-2">
							Waiting for Admin to start the game...
						</h2>
						<p className="text-sm text-slate-600">
							The game will start soon. Get ready!
						</p>
					</motion.div>
				</div>
			</div>
		);
	}

	// Game running - show scenario
	if (gameState.phase === "running" && currentScenario) {
		const progress =
			((gameState.scenarioIndex + 1) / gameState.scenarios.length) * 100;
		const isTimeWarning = timeRemaining !== null && timeRemaining <= 10;
		const isTimeExpired = timeRemaining !== null && timeRemaining === 0;

		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
				<div className="max-w-4xl mx-auto">
					{/* Team Header with Logo */}
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm p-4"
					>
						<div className="flex items-center gap-4">
							<Image
								src="/YAS-logo.png"
								alt="YAS Logo"
								width={48}
								height={48}
								className="rounded-lg"
								style={{ width: "auto", height: "auto" }}
							/>
							<div>
								<h1 className="text-2xl font-bold text-slate-900">
									{myTeam?.name}
								</h1>
								<p className="text-sm text-slate-600">
									Team {myTeam?.id}
								</p>
							</div>
						</div>
						<div className="text-right">
							<p className="text-sm text-slate-600">Scenario</p>
							<p className="text-xl font-bold text-[#4A8B8B]">
								{gameState.scenarioIndex + 1} of{" "}
								{gameState.scenarios.length}
							</p>
						</div>
					</motion.div>

					{/* Progress Bar Header */}
					<div className="mb-6">
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-2">
								<Sprout className="w-5 h-5 text-[#4A8B8B]" />
								<span className="text-lg font-semibold text-slate-700">
									Scenario {gameState.scenarioIndex + 1} of{" "}
									{gameState.scenarios.length}
								</span>
							</div>
							<div className="flex items-center gap-2">
								{/* Timer Display */}
								{timeRemaining !== null && !hasAnswered && (
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										className={`flex items-center gap-1 px-3 py-1 rounded-full font-bold ${
											isTimeExpired
												? "bg-red-500 text-white"
												: isTimeWarning
												? "bg-orange-500 text-white animate-pulse"
												: "bg-[#4A8B8B] text-white"
										}`}
									>
										<Clock className="w-4 h-4" />
										<span>{timeRemaining}s</span>
									</motion.div>
								)}
								{/* Status Badge */}
								<span
									className={`px-3 py-1 rounded-full text-sm font-medium ${
										hasAnswered
											? "bg-green-500 text-white"
											: "bg-[#4A8B8B] text-white"
									}`}
								>
									{hasAnswered ? "Submitted" : "Waiting"}
								</span>
							</div>
						</div>
						{/* Progress Bar */}
						<div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
							<motion.div
								className="h-full bg-gradient-to-r from-[#4A8B8B] to-[#5FABA8]"
								initial={{ width: 0 }}
								animate={{ width: `${progress}%` }}
								transition={{ duration: 0.5 }}
							/>
						</div>
					</div>

					{/* Time Warning Alert */}
					{isTimeWarning && !hasAnswered && (
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							className="mb-4"
						>
							<Alert className="bg-orange-50 border-orange-500">
								<AlertDescription className="text-orange-800 font-semibold">
									⚠️ Hurry up! Only {timeRemaining} seconds
									remaining! Submit your answer to avoid a -30
									coins penalty.
								</AlertDescription>
							</Alert>
						</motion.div>
					)}

					{/* Time Expired Alert with Game Rules */}
					{showRulesAlert && !hasAnswered && (
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							className="mb-4"
						>
							<Alert
								variant="destructive"
								className="bg-red-50 border-red-500"
							>
								<AlertTriangle className="h-5 w-5" />
								<AlertDescription>
									<div className="font-bold text-red-900 mb-2 text-lg">
										⏰ Time Limit Exceeded - Penalty
										Applied!
									</div>
									<div className="space-y-2 text-red-800">
										<p className="font-semibold">
											Game Rules & Penalties:
										</p>
										<ul className="list-disc list-inside space-y-1 text-sm">
											<li>
												<strong>-30 Coins</strong>{" "}
												penalty for exceeding time limit
											</li>
											<li>
												Your decision-making speed
												affects your farm's
												profitability
											</li>
											<li>
												Late decisions can lead to
												missed opportunities and
												resource waste
											</li>
											<li>
												In real farming, timing is
												critical - delayed actions cost
												money
											</li>
											<li>
												Submit your answer now to
												minimize further losses
											</li>
										</ul>
										<p className="text-xs mt-2 italic">
											💡 Tip: Plan ahead and make timely
											decisions to maximize your harvest
											rewards!
										</p>
									</div>
								</AlertDescription>
							</Alert>
						</motion.div>
					)}

					{/* Resources */}
					<div className="grid grid-cols-2 gap-4 mb-6">
						<Card>
							<CardContent className="pt-6">
								<div className="flex items-center gap-3">
									<Coins className="w-8 h-8 text-[#4A8B8B]" />
									<div>
										<div className="text-sm text-slate-600">
											Coins
										</div>
										<div className="text-2xl font-bold text-slate-900">
											{myTeam?.coins}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="flex items-center gap-3">
									<Sprout className="w-8 h-8 text-green-500" />
									<div>
										<div className="text-sm text-slate-600">
											Crops
										</div>
										<div className="text-2xl font-bold text-slate-900">
											{myTeam?.crops}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Scenario */}
					<AnimatePresence mode="wait">
						{!hasAnswered ? (
							<motion.div
								key="scenario"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
							>
								<Card className="mb-6">
									<CardHeader>
										<CardTitle>
											{currentScenario.title}
										</CardTitle>
										<CardDescription>
											{currentScenario.body}
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										{currentScenario.choices.map(
											(choice) => (
												<button
													key={choice.id}
													onClick={() =>
														setSelectedChoice(
															choice.id
														)
													}
													className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
														selectedChoice ===
														choice.id
															? "border-[#4A8B8B] bg-[#4A8B8B]/10"
															: "border-slate-200 hover:border-[#4A8B8B] hover:bg-[#4A8B8B]/5"
													}`}
												>
													<div className="font-semibold text-slate-900 mb-1">
														{choice.label}
													</div>
													{choice.desc && (
														<div className="text-sm text-slate-600 whitespace-pre-line">
															{typeof choice.desc ===
																"function" &&
															myTeam
																? choice.desc(
																		myTeam
																  )
																: typeof choice.desc ===
																  "string"
																? choice.desc
																: "[Dynamic description]"}
														</div>
													)}
													<div className="flex gap-4 mt-2 text-sm">
														{(choice.coinsDelta !==
															undefined ||
															typeof choice.coinsDelta ===
																"function") && (
															<span
																className={
																	(typeof choice.coinsDelta ===
																		"function" &&
																	myTeam
																		? choice.coinsDelta(
																				myTeam
																		  )
																		: choice.coinsDelta ||
																		  0) >=
																	0
																		? "text-green-600"
																		: "text-red-600"
																}
															>
																Coins:{" "}
																{(typeof choice.coinsDelta ===
																	"function" &&
																myTeam
																	? choice.coinsDelta(
																			myTeam
																	  )
																	: choice.coinsDelta ||
																	  0) >= 0
																	? "+"
																	: ""}
																{typeof choice.coinsDelta ===
																	"function" &&
																myTeam
																	? choice.coinsDelta(
																			myTeam
																	  )
																	: choice.coinsDelta}
															</span>
														)}
														{(choice.cropsDelta !==
															undefined ||
															typeof choice.cropsDelta ===
																"function") && (
															<span
																className={
																	(typeof choice.cropsDelta ===
																		"function" &&
																	myTeam
																		? choice.cropsDelta(
																				myTeam
																		  )
																		: choice.cropsDelta ||
																		  0) >=
																	0
																		? "text-green-600"
																		: "text-red-600"
																}
															>
																Crops:{" "}
																{(typeof choice.cropsDelta ===
																	"function" &&
																myTeam
																	? choice.cropsDelta(
																			myTeam
																	  )
																	: choice.cropsDelta ||
																	  0) >= 0
																	? "+"
																	: ""}
																{typeof choice.cropsDelta ===
																	"function" &&
																myTeam
																	? choice.cropsDelta(
																			myTeam
																	  )
																	: choice.cropsDelta}
															</span>
														)}
													</div>
												</button>
											)
										)}
									</CardContent>
								</Card>

								<Button
									onClick={handleSubmitAnswer}
									disabled={!selectedChoice}
									className="w-full bg-[#4A8B8B] hover:bg-[#3A7575] text-white"
									size="lg"
								>
									Submit Answer
								</Button>
							</motion.div>
						) : (
							<motion.div
								key="waiting"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="space-y-6"
							>
								{/* Submitted Status */}
								<div className="text-center py-8">
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{
											type: "spring",
											duration: 0.5,
										}}
									>
										<CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
									</motion.div>
									<h2 className="text-2xl font-bold text-slate-900 mb-2">
										Answer Submitted - Waiting for others...
									</h2>
								</div>

								{/* Your Outcome */}
								{outcome && (
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.3 }}
									>
										<Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-[#4A8B8B]">
											<CardHeader>
												<CardTitle className="text-center text-2xl text-[#4A8B8B]">
													Your Outcome:
												</CardTitle>
											</CardHeader>
											<CardContent className="space-y-4">
												{/* Coins */}
												<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
													<div className="flex items-center gap-3">
														<Coins className="w-8 h-8 text-[#4A8B8B]" />
														<span className="text-lg font-semibold text-slate-700">
															Coins:
														</span>
													</div>
													<div className="text-right">
														<div
															className={`text-2xl font-bold px-4 py-2 rounded-full ${
																outcome.coinsDelta >=
																0
																	? "bg-green-100 text-green-700"
																	: "bg-red-100 text-red-700"
															}`}
														>
															{outcome.coinsDelta >=
															0
																? "+"
																: ""}
															{outcome.coinsDelta}
														</div>
														{outcome.timerBonus &&
															outcome.timerBonus >
																0 && (
																<div className="text-xs text-green-600 mt-1">
																	⚡ +
																	{
																		outcome.timerBonus
																	}{" "}
																	time bonus
																</div>
															)}
														{outcome.timerPenalty &&
															outcome.timerPenalty <
																0 && (
																<div className="text-xs text-red-600 mt-1">
																	⚠️{" "}
																	{
																		outcome.timerPenalty
																	}{" "}
																	time penalty
																</div>
															)}
													</div>
												</div>

												{/* Crops */}
												<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
													<div className="flex items-center gap-3">
														<Sprout className="w-8 h-8 text-green-600" />
														<span className="text-lg font-semibold text-slate-700">
															Crops:
														</span>
													</div>
													<div
														className={`text-2xl font-bold px-4 py-2 rounded-full ${
															outcome.cropsDelta >=
															0
																? "bg-green-100 text-green-700"
																: "bg-red-100 text-red-700"
														}`}
													>
														{outcome.cropsDelta >= 0
															? "+"
															: ""}
														{outcome.cropsDelta}
													</div>
												</div>

												{/* Explanation */}
												<div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
													<p className="text-sm text-blue-900">
														<strong>
															Impact on your farm:
														</strong>
													</p>
													<ul className="list-disc list-inside text-sm text-blue-800 mt-2 space-y-1">
														{outcome.coinsDelta >
															0 && (
															<li>
																Your decision
																generated
																additional
																revenue for your
																farm
															</li>
														)}
														{outcome.coinsDelta <
															0 && (
															<li>
																This investment
																will cost you
																now but may
																benefit you
																later
															</li>
														)}
														{outcome.cropsDelta >
															0 && (
															<li>
																Your crop yield
																has increased -
																more produce to
																sell!
															</li>
														)}
														{outcome.cropsDelta <
															0 && (
															<li>
																Some crops were
																lost, but this
																may prevent
																bigger losses
															</li>
														)}
														{outcome.timerBonus &&
															outcome.timerBonus >
																0 && (
																<li className="text-green-700 font-semibold">
																	Quick
																	decision-making
																	earned you a
																	time bonus!
																</li>
															)}
														{outcome.timerPenalty &&
															outcome.timerPenalty <
																0 && (
																<li className="text-red-700 font-semibold">
																	Delayed
																	response
																	resulted in
																	additional
																	costs
																</li>
															)}
													</ul>
												</div>
											</CardContent>
										</Card>
									</motion.div>
								)}
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		);
	}

	// Game finished - show results
	if (gameState.phase === "finished" && gameState.results) {
		const myRank =
			gameState.results.leaderboard.findIndex(
				(entry) => entry.id === myTeamId
			) + 1;
		const myTotal =
			gameState.results.leaderboard.find((entry) => entry.id === myTeamId)
				?.total || 0;
		const isWinner = gameState.results.winner === myTeamId;

		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
				<div className="max-w-4xl mx-auto">
					{/* Header */}
					<div className="flex items-center gap-4 mb-8">
						<Image
							src="/YAS-logo.png"
							alt="YAS Harvest"
							width={60}
							height={60}
							className="rounded-lg"
						/>
						<div>
							<h1 className="text-3xl font-bold text-slate-900">
								Game Complete!
							</h1>
							<p className="text-slate-600">Final Results</p>
						</div>
					</div>

					{/* Winner Announcement */}
					{isWinner && (
						<motion.div
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							className="mb-8"
						>
							<Card className="bg-gradient-to-r from-[#4A8B8B] to-[#3A7575] text-white border-0">
								<CardContent className="pt-6 text-center">
									<div className="text-4xl font-bold mb-2">
										Congratulations!
									</div>
									<div className="text-xl">
										Your team won the game!
									</div>
								</CardContent>
							</Card>
						</motion.div>
					)}

					{/* Team Results */}
					<Card>
						<CardHeader>
							<CardTitle>Your Team Results</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="flex justify-between items-center">
									<span className="text-slate-600">Rank</span>
									<span className="text-2xl font-bold text-slate-900">
										#{myRank}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-slate-600">
										Total Score
									</span>
									<span className="text-2xl font-bold text-slate-900">
										{myTotal}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-slate-600">
										Final Coins
									</span>
									<span className="text-xl font-semibold text-[#4A8B8B]">
										{myTeam?.coins}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-slate-600">
										Final Crops
									</span>
									<span className="text-xl font-semibold text-green-600">
										{myTeam?.crops}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	// Fallback: Loading or unexpected state
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
			<div className="text-center">
				<motion.div
					animate={{ rotate: 360 }}
					transition={{
						duration: 2,
						repeat: Number.POSITIVE_INFINITY,
						ease: "linear",
					}}
					className="inline-block mb-4"
				>
					<Clock className="w-12 h-12 text-[#4A8B8B]" />
				</motion.div>
				<h2 className="text-xl font-bold text-slate-900 mb-2">
					Loading...
				</h2>
				<p className="text-sm text-slate-600">
					Please wait while we load your game data
				</p>
			</div>
		</div>
	);
}
