"use client";

import { useGame } from "@/lib/game-context";
import type { TeamId } from "@/lib/types";
import { GAME_SCENARIOS } from "@/lib/scenarios";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState as useReactState } from "react";
import { Navbar } from "@/components/navbar-responsive";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
	Coins,
	Sprout,
	CheckCircle2,
	Clock,
	Trophy,
	Play,
	SkipForward,
	Timer,
	Flag,
	RotateCcw,
	AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function AdminPage() {
	const router = useRouter();
	const [isAuthenticated, setIsAuthenticated] = useReactState(false);
	const [isLoading, setIsLoading] = useReactState(true);

	const {
		gameState,
		startGame,
		nextScenario,
		showWinner,
		endGameEarly,
		resetGame,
		updateRequireAllReady,
		updateTimerSettings,
		startTimer,
	} = useGame();
	const [timerDuration, setTimerDuration] = useState(
		gameState.adminOnly?.timerDuration || 60
	);
	const [adminTimeRemaining, setAdminTimeRemaining] = useState<number | null>(
		null
	);
	const [isProcessing, setIsProcessing] = useState(false);
	const [showResetDialog, setShowResetDialog] = useState(false);

	// Check authentication
	useEffect(() => {
		const checkAuth = () => {
			const authenticated = sessionStorage.getItem("admin-authenticated");
			if (authenticated === "true") {
				setIsAuthenticated(true);
				setIsLoading(false);
			} else {
				router.push("/admin/login");
			}
		};

		checkAuth();
	}, [router]);

	// Admin timer display
	useEffect(() => {
		if (
			gameState.phase === "running" &&
			gameState.adminOnly &&
			gameState.adminOnly.timerEnabled &&
			gameState.adminOnly.currentTimer
		) {
			const timer = gameState.adminOnly.currentTimer;
			const elapsed = Date.now() - timer.startTime;
			const remaining = Math.max(0, timer.duration * 1000 - elapsed);

			setAdminTimeRemaining(Math.ceil(remaining / 1000));

			const interval = setInterval(() => {
				const newElapsed = Date.now() - timer.startTime;
				const newRemaining = Math.max(
					0,
					timer.duration * 1000 - newElapsed
				);
				const seconds = Math.ceil(newRemaining / 1000);

				setAdminTimeRemaining(seconds);
			}, 100);

			return () => clearInterval(interval);
		} else {
			setAdminTimeRemaining(null);
		}
	}, [gameState.phase, gameState.adminOnly]);

	// Show loading state while checking authentication
	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A8B8B] mx-auto mb-4"></div>
					<p className="text-slate-600">Checking authentication...</p>
				</div>
			</div>
		);
	}

	// Don't render admin content if not authenticated
	if (!isAuthenticated) {
		return null;
	}

	const claimedTeams = gameState.teams
		? Object.values(gameState.teams).filter((t) => t.claimedBy)
		: [];
	const readyTeams = claimedTeams.filter((t) => t.name && t.crop);

	const canStartGame =
		gameState.phase === "lobby" &&
		(gameState.adminOnly?.requireAllReady
			? readyTeams.length === 3
			: readyTeams.length >= 1);

	// IMPORTANT: Use GAME_SCENARIOS from code, not from gameState
	// gameState.scenarios loses functions when serialized to JSON/GCS
	const currentScenario =
		gameState.scenarioIndex >= 0 &&
		gameState.scenarioIndex < GAME_SCENARIOS.length
			? GAME_SCENARIOS[gameState.scenarioIndex]
			: null;

	const allTeamsAnswered =
		gameState.phase === "running" &&
		currentScenario &&
		claimedTeams.every((team) => team.answers[gameState.scenarioIndex]);

	// Only allow proceeding when all teams have answered
	const canProceedToNext = allTeamsAnswered;

	// Handle start game with timer
	const handleStartGame = async () => {
		if (isProcessing) return;
		setIsProcessing(true);

		await startGame();
		if (gameState.adminOnly && gameState.adminOnly.timerEnabled) {
			// Start timer after a brief delay to ensure game state is updated
			setTimeout(() => {
				startTimer(0);
			}, 100);
		}

		setTimeout(() => setIsProcessing(false), 1000);
	};

	// Handle next scenario with timer
	const handleNextScenario = async () => {
		if (isProcessing) return;
		setIsProcessing(true);

		const nextIndex = gameState.scenarioIndex + 1;
		await nextScenario();
		if (
			gameState.adminOnly &&
			gameState.adminOnly.timerEnabled &&
			nextIndex < gameState.scenarios.length
		) {
			// Start timer for next scenario
			setTimeout(() => {
				startTimer(nextIndex);
			}, 100);
		}

		setTimeout(() => setIsProcessing(false), 1000);
	};

	// Handle reset game
	const handleResetGame = async () => {
		setIsProcessing(true);
		await resetGame();
		setShowResetDialog(false);
		setTimeout(() => setIsProcessing(false), 1000);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
			<Navbar />
			<div className="max-w-7xl mx-auto p-4 md:p-8">
				{/* Status Badge */}
				<motion.div
					className="flex justify-end mb-6"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<Badge
						variant="outline"
						className="text-lg px-4 py-2 border-[#4A8B8B] text-[#4A8B8B]"
					>
						{gameState.phase === "lobby" && "Lobby"}
						{gameState.phase === "running" &&
							`Scenario ${gameState.scenarioIndex + 1}/${
								gameState.scenarios.length
							}`}
						{gameState.phase === "finished" && "Finished"}
					</Badge>
				</motion.div>

				{/* Lobby Phase */}
				{gameState.phase === "lobby" && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-6"
					>
						{/* Settings */}
						<Card>
							<CardHeader>
								<CardTitle>Game Settings</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Require All Teams */}
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label htmlFor="require-all">
											Require All Teams Ready
										</Label>
										<div className="text-sm text-slate-600">
											All three teams must be ready to
											start the game
										</div>
									</div>
									<Switch
										id="require-all"
										checked={
											gameState.adminOnly
												?.requireAllReady || false
										}
										onCheckedChange={updateRequireAllReady}
									/>
								</div>

								{/* Timer Settings */}
								<div className="border-t pt-6">
									<div className="flex items-center justify-between mb-4">
										<div className="space-y-0.5">
											<Label
												htmlFor="timer-enabled"
												className="flex items-center gap-2"
											>
												<Timer className="w-4 h-4 text-[#4A8B8B]" />
												Enable Timer
											</Label>
											<div className="text-sm text-slate-600">
												Set time limit for each scenario
											</div>
										</div>
										<Switch
											id="timer-enabled"
											checked={
												gameState.adminOnly
													?.timerEnabled || false
											}
											onCheckedChange={(enabled) =>
												updateTimerSettings(
													enabled,
													timerDuration
												)
											}
										/>
									</div>

									{gameState.adminOnly &&
										gameState.adminOnly.timerEnabled && (
											<div className="space-y-2">
												<Label htmlFor="timer-duration">
													Duration (seconds)
												</Label>
												<div className="flex gap-2">
													<Input
														id="timer-duration"
														type="number"
														min="10"
														max="300"
														value={timerDuration}
														onChange={(e) =>
															setTimerDuration(
																Number.parseInt(
																	e.target
																		.value
																)
															)
														}
														className="w-32"
													/>
													<Button
														onClick={() =>
															updateTimerSettings(
																true,
																timerDuration
															)
														}
														variant="outline"
														size="sm"
														className="border-[#4A8B8B] text-[#4A8B8B] hover:bg-[#4A8B8B]/10"
													>
														Apply
													</Button>
												</div>
												<p className="text-xs text-slate-500">
													⚡ Bonus: +50 coins if
													completed within time
													<br />
													⚠️ Penalty: -30 coins if
													time exceeded
												</p>
											</div>
										)}
								</div>
							</CardContent>
						</Card>

						{/* Team Status */}
						<Card>
							<CardHeader>
								<CardTitle>Team Status</CardTitle>
								<CardDescription>
									{readyTeams.length} of 3 teams ready
									{gameState.adminOnly?.requireAllReady
										? " (all required)"
										: " (at least 1 required)"}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									{(["A", "B", "C"] as TeamId[]).map(
										(teamId) => {
											const team =
												gameState.teams[teamId];
											const isClaimed = !!team.claimedBy;
											const isReady = !!(
												team.name && team.crop
											);

											return (
												<div
													key={teamId}
													className={`p-6 rounded-lg border-2 ${
														isReady
															? "border-green-500 bg-green-50"
															: isClaimed
															? "border-[#4A8B8B] bg-[#4A8B8B]/10"
															: "border-slate-200 bg-slate-50"
													}`}
												>
													<div className="flex items-center justify-between mb-4">
														<h3 className="text-xl font-bold text-slate-900">
															Team {teamId}
														</h3>
														{isReady ? (
															<CheckCircle2 className="w-6 h-6 text-green-500" />
														) : isClaimed ? (
															<Clock className="w-6 h-6 text-[#4A8B8B]" />
														) : (
															<div className="w-6 h-6 rounded-full border-2 border-slate-300" />
														)}
													</div>
													{isClaimed ? (
														<div className="space-y-2 text-sm">
															<div>
																<span className="text-slate-600">
																	Name:
																</span>{" "}
																<span className="font-semibold text-slate-900">
																	{team.name ||
																		"Not set"}
																</span>
															</div>
															<div>
																<span className="text-slate-600">
																	Crop:
																</span>{" "}
																<span className="font-semibold text-slate-900">
																	{team.crop ||
																		"Not selected"}
																</span>
															</div>
															<div>
																<Badge
																	variant={
																		isReady
																			? "default"
																			: "secondary"
																	}
																	className={`mt-2 ${
																		isReady
																			? "bg-gradient-to-r from-[#4A8B8B] to-[#5FABA8] text-white border-0"
																			: ""
																	}`}
																>
																	{isReady
																		? "Ready"
																		: "Setting up"}
																</Badge>
															</div>
														</div>
													) : (
														<div className="text-sm text-slate-500">
															Waiting for
															player...
														</div>
													)}
												</div>
											);
										}
									)}
								</div>
							</CardContent>
						</Card>

						<Button
							onClick={handleStartGame}
							disabled={!canStartGame || isProcessing}
							className="w-full bg-[#4A8B8B] hover:bg-[#3A7575] text-white"
							size="lg"
						>
							<Play className="w-5 h-5 mr-2" />
							{isProcessing ? "Starting..." : "Start Activity"}
						</Button>
					</motion.div>
				)}

				{/* Running Phase */}
				{gameState.phase === "running" && currentScenario && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-6"
					>
						{/* Timer Display for Admin */}
						{gameState.adminOnly &&
							gameState.adminOnly.timerEnabled &&
							adminTimeRemaining !== null && (
								<motion.div
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
								>
									<Card
										className={`border-2 ${
											adminTimeRemaining <= 10
												? adminTimeRemaining === 0
													? "border-red-500 bg-red-50"
													: "border-orange-500 bg-orange-50"
												: "border-[#4A8B8B] bg-[#4A8B8B]/5"
										}`}
									>
										<CardContent className="pt-6">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-3">
													<Timer
														className={`w-8 h-8 ${
															adminTimeRemaining <=
															10
																? adminTimeRemaining ===
																  0
																	? "text-red-600"
																	: "text-orange-600"
																: "text-[#4A8B8B]"
														}`}
													/>
													<div>
														<div className="text-sm text-slate-600">
															Time Remaining
														</div>
														<div
															className={`text-3xl font-bold ${
																adminTimeRemaining <=
																10
																	? adminTimeRemaining ===
																	  0
																		? "text-red-600"
																		: "text-orange-600"
																	: "text-[#4A8B8B]"
															}`}
														>
															{adminTimeRemaining}
															s
														</div>
													</div>
												</div>
												<div className="text-right">
													<Badge
														variant={
															adminTimeRemaining ===
															0
																? "destructive"
																: adminTimeRemaining <=
																  10
																? "default"
																: "outline"
														}
														className={`text-lg px-4 py-2 ${
															adminTimeRemaining >
															10
																? "border-[#4A8B8B] text-[#4A8B8B]"
																: adminTimeRemaining ===
																  0
																? "bg-red-600"
																: "bg-orange-500"
														}`}
													>
														{adminTimeRemaining ===
														0
															? "Time Expired"
															: adminTimeRemaining <=
															  10
															? "Hurry Up!"
															: "In Progress"}
													</Badge>
												</div>
											</div>
											{adminTimeRemaining === 0 && (
												<div className="mt-4 p-3 bg-red-100 rounded-lg border border-red-300">
													<p className="text-sm text-red-800 font-semibold">
														⚠️ Teams that haven't
														submitted will receive a
														-30 coins penalty
													</p>
												</div>
											)}
										</CardContent>
									</Card>
								</motion.div>
							)}

						{/* Current Scenario */}
						<Card>
							<CardHeader>
								<CardTitle>{currentScenario.title}</CardTitle>
								<CardDescription>
									{currentScenario.body}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{currentScenario.choices.map((choice) => (
										<div
											key={choice.id}
											className="p-4 rounded-lg bg-slate-50 border border-slate-200"
										>
											<div className="font-semibold text-slate-900 mb-1">
												{choice.label}
											</div>
											{choice.desc && (
												<div className="text-sm text-slate-600 mb-2 whitespace-pre-line">
													{typeof choice.desc ===
													"function"
														? "[Dynamic description based on team state]"
														: choice.desc}
												</div>
											)}
											<div className="flex gap-4 text-sm">
												{/* Coins Delta */}
												{(() => {
													// Use first claimed team or default values
													const sampleTeam =
														Object.values(
															gameState.teams
														).find(
															(t) => t.claimedBy
														) || {
															id: "A" as TeamId,
															coins: 1000,
															crops: 10,
															answers: {},
														};

													const coinsValue =
														typeof choice.coinsDelta ===
														"function"
															? choice.coinsDelta(
																	sampleTeam
															  )
															: typeof choice.coinsDelta ===
															  "number"
															? choice.coinsDelta
															: null;

													if (coinsValue === null)
														return null;

													return (
														<span
															className={
																coinsValue >= 0
																	? "text-green-600 font-semibold"
																	: "text-red-600 font-semibold"
															}
														>
															Coins:{" "}
															{coinsValue >= 0
																? "+"
																: ""}
															{coinsValue}
														</span>
													);
												})()}

												{/* Crops Delta */}
												{(() => {
													// Use first claimed team or default values
													const sampleTeam =
														Object.values(
															gameState.teams
														).find(
															(t) => t.claimedBy
														) || {
															id: "A" as TeamId,
															coins: 1000,
															crops: 10,
															answers: {},
														};

													const cropsValue =
														typeof choice.cropsDelta ===
														"function"
															? choice.cropsDelta(
																	sampleTeam
															  )
															: typeof choice.cropsDelta ===
															  "number"
															? choice.cropsDelta
															: null;

													if (cropsValue === null)
														return null;

													return (
														<span
															className={
																cropsValue >= 0
																	? "text-green-600 font-semibold"
																	: "text-red-600 font-semibold"
															}
														>
															Crops:{" "}
															{cropsValue >= 0
																? "+"
																: ""}
															{cropsValue}
														</span>
													);
												})()}
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Team Answers */}
						<Card>
							<CardHeader>
								<CardTitle>Team Answers</CardTitle>
								<CardDescription>
									{
										claimedTeams.filter(
											(t) =>
												t.answers[
													gameState.scenarioIndex
												]
										).length
									}{" "}
									of {claimedTeams.length} teams answered
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									{claimedTeams.map((team) => {
										const hasAnswered =
											!!team.answers[
												gameState.scenarioIndex
											];
										const answer =
											team.answers[
												gameState.scenarioIndex
											];
										const choice = answer
											? currentScenario.choices.find(
													(c) =>
														c.id === answer.choiceId
											  )
											: null;

										return (
											<div
												key={team.id}
												className={`p-6 rounded-lg border-2 ${
													hasAnswered
														? "border-green-500 bg-green-50"
														: "border-[#4A8B8B] bg-[#4A8B8B]/10"
												}`}
											>
												<div className="flex items-center justify-between mb-4">
													<div>
														<h3 className="text-lg font-bold text-slate-900">
															{team.name}
														</h3>
														<div className="text-sm text-slate-600">
															Team {team.id}
														</div>
													</div>
													{hasAnswered ? (
														<CheckCircle2 className="w-6 h-6 text-green-500" />
													) : (
														<Clock className="w-6 h-6 text-[#4A8B8B]" />
													)}
												</div>
												<div className="space-y-2">
													<div className="flex items-center gap-2 text-sm">
														<Coins className="w-4 h-4 text-[#4A8B8B]" />
														<span className="font-semibold text-slate-900">
															{team.coins}
														</span>
													</div>
													<div className="flex items-center gap-2 text-sm">
														<Sprout className="w-4 h-4 text-green-500" />
														<span className="font-semibold text-slate-900">
															{team.crops}
														</span>
													</div>
													{hasAnswered && choice && (
														<div className="mt-3 pt-3 border-t border-green-200">
															<div className="text-xs text-slate-600 mb-1">
																Selected:
															</div>
															<div className="text-sm font-medium text-slate-900">
																{choice.label}
															</div>
														</div>
													)}
												</div>
											</div>
										);
									})}
								</div>
							</CardContent>
						</Card>

						{/* Teams Progress Indicator */}
						<div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
							<span className="text-sm font-medium text-slate-700">
								Teams Answered:
							</span>
							<div className="flex items-center gap-2">
								<span
									className={`text-lg font-bold ${
										allTeamsAnswered
											? "text-green-600"
											: "text-orange-600"
									}`}
								>
									{
										claimedTeams.filter(
											(team) =>
												team.answers[
													gameState.scenarioIndex
												]
										).length
									}{" "}
									/ {claimedTeams.length}
								</span>
								{allTeamsAnswered && (
									<CheckCircle2 className="w-5 h-5 text-green-600" />
								)}
							</div>
						</div>

						{/* Action Buttons */}
						<div className="space-y-3">
							<Button
								onClick={handleNextScenario}
								disabled={!canProceedToNext || isProcessing}
								className={`w-full text-white transition-all ${
									!canProceedToNext || isProcessing
										? "bg-slate-400 cursor-not-allowed opacity-50"
										: "bg-[#4A8B8B] hover:bg-[#3A7575]"
								}`}
								size="lg"
							>
								<SkipForward className="w-5 h-5 mr-2" />
								{isProcessing
									? "Processing..."
									: !allTeamsAnswered
									? `Waiting for ${
											claimedTeams.length -
											claimedTeams.filter(
												(team) =>
													team.answers[
														gameState.scenarioIndex
													]
											).length
									  } team(s)...`
									: gameState.scenarioIndex <
									  gameState.scenarios.length - 1
									? "Next Question"
									: "Finish Game"}
							</Button>

							{/* End Game Early Button - Only show if not on last scenario */}
							{gameState.scenarioIndex <
								gameState.scenarios.length - 1 && (
								<Button
									onClick={endGameEarly}
									disabled={isProcessing}
									variant="outline"
									className="w-full border-2 border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
									size="lg"
								>
									<Flag className="w-5 h-5 mr-2" />
									{isProcessing
										? "Ending Game..."
										: "End Game & Show Results Now"}
								</Button>
							)}
						</div>
					</motion.div>
				)}

				{/* Finished Phase */}
				{gameState.phase === "finished" && gameState.results && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-6"
					>
						{/* Leaderboard */}
						<Card>
							<CardHeader>
								<CardTitle>Final Results</CardTitle>
								<CardDescription>
									Game completed - here are the final
									standings
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{gameState.results.leaderboard.map(
										(entry, index) => {
											const team =
												gameState.teams[entry.id];
											const isWinner = index === 0;

											return (
												<div
													key={entry.id}
													className={`p-6 rounded-lg border-2 ${
														isWinner
															? "border-[#4A8B8B] bg-gradient-to-r from-[#4A8B8B]/10 to-[#3A7575]/10"
															: "border-slate-200 bg-slate-50"
													}`}
												>
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-4">
															<div
																className={`text-3xl font-bold ${
																	isWinner
																		? "text-[#4A8B8B]"
																		: "text-slate-600"
																}`}
															>
																#{index + 1}
															</div>
															<div>
																<h3 className="text-xl font-bold text-slate-900">
																	{team.name}
																</h3>
																<div className="text-sm text-slate-600">
																	Team{" "}
																	{team.id}
																</div>
															</div>
															{isWinner && (
																<Trophy className="w-8 h-8 text-[#4A8B8B]" />
															)}
														</div>
														<div className="text-right">
															<div className="text-3xl font-bold text-slate-900">
																{entry.total}
															</div>
															<div className="text-sm text-slate-600">
																Total Score
															</div>
														</div>
													</div>
													<div className="flex gap-6 mt-4 pt-4 border-t border-slate-200">
														<div className="flex items-center gap-2">
															<Coins className="w-5 h-5 text-[#4A8B8B]" />
															<span className="font-semibold text-slate-900">
																{team.coins}{" "}
																coins
															</span>
														</div>
														<div className="flex items-center gap-2">
															<Sprout className="w-5 h-5 text-green-500" />
															<span className="font-semibold text-slate-900">
																{team.crops}{" "}
																crops
															</span>
														</div>
													</div>
												</div>
											);
										}
									)}
								</div>
							</CardContent>
						</Card>

						{/* Action Buttons */}
						<div className="space-y-3">
							{/* Only show "Show Winner" button if game finished naturally (not ended early) */}
							{!gameState.results?.endedEarly && (
								<Button
									onClick={showWinner}
									className="w-full bg-gradient-to-r from-[#4A8B8B] to-[#5FABA8] hover:from-[#3A7575] hover:to-[#4A8B8B] text-white"
									size="lg"
								>
									<Trophy className="w-5 h-5 mr-2" />
									Show Winner to Players
								</Button>
							)}

							{/* Reset Game Button with Confirmation Dialog */}
							<AlertDialog
								open={showResetDialog}
								onOpenChange={setShowResetDialog}
							>
								<AlertDialogTrigger asChild>
									<Button
										variant="outline"
										className="w-full border-2 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
										size="lg"
										disabled={isProcessing}
									>
										<RotateCcw className="w-5 h-5 mr-2" />
										Reset Game
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle className="flex items-center gap-2 text-red-600">
											<AlertTriangle className="w-6 h-6" />
											Reset Game?
										</AlertDialogTitle>
										<AlertDialogDescription className="space-y-2">
											<p className="font-semibold text-slate-900">
												Are you sure you want to reset
												the game?
											</p>
											<p>This action will:</p>
											<ul className="list-disc list-inside space-y-1 text-sm">
												<li>
													Clear all team data and
													answers
												</li>
												<li>
													Reset all scores to initial
													values
												</li>
												<li>Return to lobby phase</li>
												<li>Remove all team claims</li>
											</ul>
											<p className="text-red-600 font-semibold mt-2">
												⚠️ This cannot be undone!
											</p>
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>
											Cancel
										</AlertDialogCancel>
										<AlertDialogAction
											onClick={handleResetGame}
											className="bg-red-600 hover:bg-red-700 text-white"
										>
											Yes, Reset Game
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					</motion.div>
				)}
			</div>
		</div>
	);
}
