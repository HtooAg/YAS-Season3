"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/lib/game-context";
import { type TeamId } from "@/lib/types";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Coins,
	Sprout,
	Clock,
	CheckCircle2,
	AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ScenarioPage() {
	const router = useRouter();
	const { gameState, submitAnswer, submitTimePenalty } = useGame();
	const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

	// Get team ID from session storage
	const myTeamId =
		typeof window !== "undefined"
			? (sessionStorage.getItem("yas-harvest-team-id") as TeamId | null)
			: null;

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

	// Redirect to pending if game not running
	useEffect(() => {
		if (gameState.phase === "lobby") {
			router.push("/player/pending");
		} else if (gameState.phase === "finished") {
			router.push("/player/results");
		}
	}, [gameState.phase, router]);

	// Redirect to team selection if no team claimed
	useEffect(() => {
		if (!myTeamId) {
			router.push("/player");
		}
	}, [myTeamId, router]);

	// Timer countdown effect with auto-submit
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

				if (seconds <= 10 && seconds > 0 && !showTimeWarning) {
					setShowTimeWarning(true);
				}

				if (seconds === 0 && !timePenaltyApplied && !showRulesAlert) {
					setShowRulesAlert(true);
					setTimePenaltyApplied(true);

					// Auto-submit based on whether a choice was selected
					if (myTeamId) {
						if (selectedChoice) {
							// Submit the selected choice with time penalty
							submitAnswer(
								myTeamId,
								gameState.scenarioIndex,
								selectedChoice
							);
						} else {
							// No choice selected - only apply -30 coins penalty
							submitTimePenalty(
								myTeamId,
								gameState.scenarioIndex
							);
						}
					}
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
		myTeamId,
		currentScenario,
		selectedChoice,
		gameState.scenarioIndex,
		submitAnswer,
		submitTimePenalty,
	]);

	// Get outcome from stored answer
	useEffect(() => {
		if (hasAnswered && myTeam) {
			const answer = myTeam.answers[gameState.scenarioIndex];

			// Use the stored outcome if available
			if (answer.outcome) {
				setOutcome(answer.outcome);
			} else {
				// Fallback for old answers without stored outcomes
				setOutcome({
					coinsDelta: 0,
					cropsDelta: 0,
				});
			}
		} else {
			setOutcome(null);
		}
	}, [hasAnswered, myTeam, gameState.scenarioIndex]);

	// Reset timer states when scenario changes
	useEffect(() => {
		setTimePenaltyApplied(false);
		setShowRulesAlert(false);
		setShowTimeWarning(false);
		setSelectedChoice(null);
	}, [gameState.scenarioIndex]);

	const handleSubmitAnswer = () => {
		if (!myTeamId || !selectedChoice) return;
		submitAnswer(myTeamId, gameState.scenarioIndex, selectedChoice);
		setSelectedChoice(null);
	};

	if (!currentScenario || gameState.phase !== "running") {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
				<div className="text-center">
					<Clock className="w-12 h-12 text-[#4A8B8B] mx-auto mb-4 animate-spin" />
					<h2 className="text-xl font-bold text-slate-900 mb-2">
						Loading...
					</h2>
				</div>
			</div>
		);
	}

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
									{currentScenario.choices.map((choice) => (
										<button
											key={choice.id}
											onClick={() =>
												setSelectedChoice(choice.id)
											}
											className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
												selectedChoice === choice.id
													? "border-[#4A8B8B] bg-[#4A8B8B]/10"
													: "border-slate-200 hover:border-[#4A8B8B] hover:bg-[#4A8B8B]/5"
											}`}
										>
											<div className="font-semibold text-slate-900 mb-1">
												{choice.label}
											</div>
											{choice.desc && (
												<div className="text-sm text-slate-600 whitespace-pre-line">
													{choice.desc}
												</div>
											)}
											<div className="flex gap-4 mt-2 text-sm">
												{choice.coinsDelta !==
													undefined &&
													myTeam && (
														<span
															className={(() => {
																const value =
																	typeof choice.coinsDelta ===
																	"function"
																		? choice.coinsDelta(
																				myTeam
																		  )
																		: choice.coinsDelta;
																return value >=
																	0
																	? "text-green-600 font-semibold"
																	: "text-red-600 font-semibold";
															})()}
														>
															Coins:{" "}
															{(() => {
																const value =
																	typeof choice.coinsDelta ===
																	"function"
																		? choice.coinsDelta(
																				myTeam
																		  )
																		: choice.coinsDelta;
																return `${
																	value >= 0
																		? "+"
																		: ""
																}${value}`;
															})()}
														</span>
													)}
												{choice.cropsDelta !==
													undefined &&
													myTeam && (
														<span
															className={(() => {
																const value =
																	typeof choice.cropsDelta ===
																	"function"
																		? choice.cropsDelta(
																				myTeam
																		  )
																		: choice.cropsDelta;
																return value >=
																	0
																	? "text-green-600 font-semibold"
																	: "text-red-600 font-semibold";
															})()}
														>
															Crops:{" "}
															{(() => {
																const value =
																	typeof choice.cropsDelta ===
																	"function"
																		? choice.cropsDelta(
																				myTeam
																		  )
																		: choice.cropsDelta;
																return `${
																	value >= 0
																		? "+"
																		: ""
																}${value}`;
															})()}
														</span>
													)}
											</div>
										</button>
									))}
								</CardContent>
							</Card>

							<Button
								onClick={handleSubmitAnswer}
								disabled={!selectedChoice || isTimeExpired}
								className="w-full bg-[#4A8B8B] hover:bg-[#3A7575] text-white disabled:opacity-50 disabled:cursor-not-allowed"
								size="lg"
							>
								{isTimeExpired
									? "Time Expired - Auto-Submitting..."
									: "Submit Answer"}
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
														{outcome.coinsDelta >= 0
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
														outcome.cropsDelta >= 0
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

											{/* Final Resources After Outcome */}
											<div className="p-4 bg-gradient-to-r from-[#4A8B8B]/10 to-[#5FABA8]/10 rounded-lg border-2 border-[#4A8B8B]">
												<p className="text-sm font-bold text-[#4A8B8B] mb-3 text-center">
													📊 Your Farm After This
													Decision:
												</p>
												<div className="grid grid-cols-2 gap-3">
													<div className="flex items-center justify-between p-3 bg-white rounded-lg">
														<div className="flex items-center gap-2">
															<Coins className="w-5 h-5 text-[#4A8B8B]" />
															<span className="text-sm font-medium text-slate-700">
																Coins:
															</span>
														</div>
														<span className="text-lg font-bold text-slate-900">
															{myTeam?.coins || 0}
														</span>
													</div>
													<div className="flex items-center justify-between p-3 bg-white rounded-lg">
														<div className="flex items-center gap-2">
															<Sprout className="w-5 h-5 text-green-600" />
															<span className="text-sm font-medium text-slate-700">
																Crops:
															</span>
														</div>
														<span className="text-lg font-bold text-slate-900">
															{myTeam?.crops || 0}
														</span>
													</div>
												</div>
											</div>

											{/* Explanation */}
											<div
												className={`p-4 rounded-lg border ${
													outcome.coinsDelta ===
														-30 &&
													outcome.cropsDelta === 0 &&
													outcome.timerPenalty
														? "bg-red-50 border-red-200"
														: "bg-blue-50 border-blue-200"
												}`}
											>
												<p
													className={`text-sm font-semibold ${
														outcome.coinsDelta ===
															-30 &&
														outcome.cropsDelta ===
															0 &&
														outcome.timerPenalty
															? "text-red-900"
															: "text-blue-900"
													}`}
												>
													<strong>
														Impact on your farm:
													</strong>
												</p>
												<ul
													className={`list-disc list-inside text-sm mt-2 space-y-1 ${
														outcome.coinsDelta ===
															-30 &&
														outcome.cropsDelta ===
															0 &&
														outcome.timerPenalty
															? "text-red-800"
															: "text-blue-800"
													}`}
												>
													{outcome.coinsDelta ===
														-30 &&
													outcome.cropsDelta === 0 &&
													outcome.timerPenalty ? (
														<>
															<li className="font-semibold">
																⏰ Time expired
																without making a
																decision
															</li>
															<li>
																No choice was
																selected, so
																only the time
																penalty was
																applied
															</li>
															<li>
																In farming,
																indecision costs
																money - delays
																in
																decision-making
																lead to missed
																opportunities
															</li>
															<li>
																Make faster
																decisions in
																future scenarios
																to avoid
																penalties
															</li>
														</>
													) : (
														<>
															{outcome.coinsDelta >
																0 && (
																<li>
																	Your
																	decision
																	generated
																	additional
																	revenue for
																	your farm
																</li>
															)}
															{outcome.coinsDelta <
																0 &&
																!outcome.timerPenalty && (
																	<li>
																		This
																		investment
																		will
																		cost you
																		now but
																		may
																		benefit
																		you
																		later
																	</li>
																)}
															{outcome.cropsDelta >
																0 && (
																<li>
																	Your crop
																	yield has
																	increased -
																	more produce
																	to sell!
																</li>
															)}
															{outcome.cropsDelta <
																0 && (
																<li>
																	Some crops
																	were lost,
																	but this may
																	prevent
																	bigger
																	losses
																</li>
															)}
															{outcome.timerBonus &&
																outcome.timerBonus >
																	0 && (
																	<li className="text-green-700 font-semibold">
																		Quick
																		decision-making
																		earned
																		you a
																		time
																		bonus!
																	</li>
																)}
															{outcome.timerPenalty &&
																outcome.timerPenalty <
																	0 &&
																outcome.coinsDelta !==
																	-30 && (
																	<li className="text-red-700 font-semibold">
																		Delayed
																		response
																		resulted
																		in
																		additional
																		costs
																	</li>
																)}
														</>
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
