"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/lib/game-context";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Award, Coins, Sprout, Users } from "lucide-react";
import Image from "next/image";

interface Firework {
	id: number;
	x: number;
	y: number;
	color: string;
	particles: number;
}

export default function ResultsPage() {
	const router = useRouter();
	const { gameState } = useGame();
	const [fireworks, setFireworks] = useState<Firework[]>([]);

	// Get team ID from session storage
	const myTeamId =
		typeof window !== "undefined"
			? (sessionStorage.getItem("yas-harvest-team-id") as
					| "A"
					| "B"
					| "C"
					| null)
			: null;

	const myTeam =
		myTeamId && gameState.teams ? gameState.teams[myTeamId] : null;

	// Redirect if game not finished
	useEffect(() => {
		if (gameState.phase !== "finished") {
			router.push("/player");
		}
	}, [gameState.phase, router]);

	// Fireworks effect
	useEffect(() => {
		if (gameState.phase !== "finished") return;

		const colors = [
			"#FFD700",
			"#FF6B6B",
			"#4ECDC4",
			"#45B7D1",
			"#FFA07A",
			"#98D8C8",
			"#F7DC6F",
			"#BB8FCE",
			"#FF1493",
			"#00CED1",
			"#FF4500",
			"#32CD32",
		];

		const interval = setInterval(() => {
			// Create 2-3 fireworks at once for more impressive effect
			const count = Math.random() > 0.5 ? 2 : 3;
			for (let i = 0; i < count; i++) {
				setTimeout(() => {
					const newFirework: Firework = {
						id: Date.now() + Math.random(),
						x: Math.random() * 90 + 5,
						y: Math.random() * 70 + 5,
						color: colors[
							Math.floor(Math.random() * colors.length)
						],
						particles: 16 + Math.floor(Math.random() * 12),
					};

					setFireworks((prev) => [...prev, newFirework]);

					setTimeout(() => {
						setFireworks((prev) =>
							prev.filter((f) => f.id !== newFirework.id)
						);
					}, 2500);
				}, i * 100);
			}
		}, 400);

		return () => clearInterval(interval);
	}, [gameState.phase]);

	if (!gameState.results || !myTeam) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-xl font-bold text-slate-900">
						Loading...
					</h2>
				</div>
			</div>
		);
	}

	const myRank =
		gameState.results.leaderboard.findIndex(
			(entry) => entry.id === myTeamId
		) + 1;
	const myTotal =
		gameState.results.leaderboard.find((entry) => entry.id === myTeamId)
			?.total || 0;
	const isWinner = myRank === 1;
	const isTopThree = myRank <= 3;

	// Medal icons based on rank - larger and more visible with background
	const getMedalIcon = (rank: number) => {
		if (rank === 1)
			return (
				<div className="relative">
					<div className="absolute inset-0 bg-white rounded-full blur-xl opacity-50" />
					<Trophy
						className="relative w-32 h-32 text-yellow-400 drop-shadow-2xl"
						strokeWidth={3}
						fill="currentColor"
					/>
				</div>
			);
		if (rank === 2)
			return (
				<div className="relative">
					<div className="absolute inset-0 bg-white rounded-full blur-xl opacity-50" />
					<Medal
						className="relative w-32 h-32 text-slate-200 drop-shadow-2xl"
						strokeWidth={3}
						fill="currentColor"
					/>
				</div>
			);
		if (rank === 3)
			return (
				<div className="relative">
					<div className="absolute inset-0 bg-white rounded-full blur-xl opacity-50" />
					<Award
						className="relative w-32 h-32 text-amber-500 drop-shadow-2xl"
						strokeWidth={3}
						fill="currentColor"
					/>
				</div>
			);
		return (
			<div className="relative">
				<div className="absolute inset-0 bg-white rounded-full blur-lg opacity-40" />
				<Award
					className="relative w-24 h-24 text-slate-300 drop-shadow-lg"
					strokeWidth={2.5}
					fill="currentColor"
				/>
			</div>
		);
	};

	const getRankColor = (rank: number) => {
		if (rank === 1) return "from-yellow-500 to-yellow-700";
		if (rank === 2) return "from-slate-400 to-slate-600";
		if (rank === 3) return "from-orange-500 to-orange-700";
		return "from-slate-500 to-slate-700";
	};

	const getRankText = (rank: number) => {
		if (rank === 1) return "🥇 1st Place!";
		if (rank === 2) return "🥈 2nd Place!";
		if (rank === 3) return "🥉 3rd Place!";
		return `#${rank} Place`;
	};

	const getRankMessage = (rank: number) => {
		if (rank === 1) return "🎉 Congratulations! You're the champion!";
		if (rank === 2) return "Great job! Second place!";
		if (rank === 3) return "Well done! Third place!";
		return "Good effort! Keep improving!";
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 md:p-8 relative overflow-hidden">
			{/* Enhanced Fireworks animation */}
			{fireworks.map((firework) => (
				<motion.div
					key={firework.id}
					className="absolute pointer-events-none z-10"
					style={{
						left: `${firework.x}%`,
						top: `${firework.y}%`,
					}}
				>
					{/* Center burst */}
					<motion.div
						className="absolute w-3 h-3 rounded-full"
						style={{ backgroundColor: firework.color }}
						initial={{ scale: 1, opacity: 1 }}
						animate={{ scale: 0, opacity: 0 }}
						transition={{ duration: 0.4, ease: "easeOut" }}
					/>
					{/* Particles */}
					{[...Array(firework.particles)].map((_, i) => {
						const angle = (i * Math.PI * 2) / firework.particles;
						const distance = 60 + Math.random() * 40;
						const duration = 1.2 + Math.random() * 0.6;
						return (
							<motion.div
								key={i}
								className="absolute rounded-full"
								style={{
									width: Math.random() * 4 + 2,
									height: Math.random() * 4 + 2,
									backgroundColor: firework.color,
									boxShadow: `0 0 ${
										Math.random() * 10 + 5
									}px ${firework.color}`,
								}}
								initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
								animate={{
									x: Math.cos(angle) * distance,
									y:
										Math.sin(angle) * distance +
										Math.random() * 20,
									opacity: 0,
									scale: 0,
								}}
								transition={{
									duration,
									ease: "easeOut",
								}}
							/>
						);
					})}
					{/* Trail particles */}
					{[...Array(6)].map((_, i) => {
						const angle = (i * Math.PI * 2) / 6;
						const distance = 30;
						return (
							<motion.div
								key={`trail-${i}`}
								className="absolute w-1 h-1 rounded-full"
								style={{
									backgroundColor: firework.color,
									opacity: 0.6,
								}}
								initial={{ x: 0, y: 0, opacity: 0.6 }}
								animate={{
									x: Math.cos(angle) * distance,
									y: Math.sin(angle) * distance,
									opacity: 0,
								}}
								transition={{
									duration: 0.8,
									ease: "easeOut",
									delay: 0.2,
								}}
							/>
						);
					})}
				</motion.div>
			))}

			<div className="max-w-4xl mx-auto relative z-20">
				{/* Header with Logo */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex items-center justify-center gap-4 mb-8 flex-col"
				>
					<Image
						src="/YAS-logo.png"
						alt="YAS Harvest"
						width={100}
						height={100}
					/>
					<div className="text-center">
						<h1 className="text-3xl md:text-4xl font-bold text-slate-900">
							Game Complete!
						</h1>
						<p className="text-slate-600">Final Results</p>
					</div>
				</motion.div>

				{/* Your Rank Card */}
				<motion.div
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ delay: 0.2, type: "spring", duration: 0.8 }}
					className="mb-8"
				>
					<Card
						className={`bg-gradient-to-br ${getRankColor(
							myRank
						)} text-white border-0 shadow-2xl`}
					>
						<CardContent className="pt-8 pb-8">
							<div className="text-center space-y-4">
								{/* Medal Icon */}
								<motion.div
									initial={{ scale: 0, rotate: -180 }}
									animate={{ scale: 1, rotate: 0 }}
									transition={{
										delay: 0.4,
										type: "spring",
										duration: 1,
									}}
									className="flex justify-center"
								>
									{getMedalIcon(myRank)}
								</motion.div>

								{/* Rank */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.6 }}
								>
									<h2 className="text-5xl md:text-6xl font-bold mb-2">
										{getRankText(myRank)}
									</h2>
									<p className="text-lg md:text-xl opacity-90">
										{getRankMessage(myRank)}
									</p>
								</motion.div>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Team Details Card */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.8 }}
					className="mb-8"
				>
					<Card className="bg-white/90 backdrop-blur shadow-xl">
						<CardContent className="pt-6 space-y-3">
							{/* Team Name */}
							<div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
								<span className="text-base font-semibold text-slate-700 flex items-center gap-2">
									<Users className="w-5 h-5 text-[#4A8B8B]" />
									Team:
								</span>
								<span className="text-lg font-bold text-slate-900">
									Team {myTeam.id} - {myTeam.name}
								</span>
							</div>

							{/* Final Score */}
							<div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#4A8B8B] to-[#5FABA8] rounded-lg">
								<span className="text-base font-semibold text-white flex items-center gap-2">
									<Trophy className="w-5 h-5 text-white" />
									Final Score:
								</span>
								<span className="text-2xl font-bold text-white bg-white/20 px-5 py-1.5 rounded-full">
									{myTotal} points
								</span>
							</div>

							{/* Final Coins */}
							<div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
								<span className="text-base font-semibold text-slate-700 flex items-center gap-2">
									<Coins className="w-5 h-5 text-[#4A8B8B]" />
									Final Coins:
								</span>
								<span className="text-xl font-bold text-[#4A8B8B]">
									💰 {myTeam.coins}
								</span>
							</div>

							{/* Final Crops */}
							<div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
								<span className="text-base font-semibold text-slate-700 flex items-center gap-2">
									<Sprout className="w-5 h-5 text-green-600" />
									Final Crops:
								</span>
								<span className="text-xl font-bold text-green-600">
									🌾 {myTeam.crops}
								</span>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Final Standings */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 1 }}
				>
					<Card className="bg-white/90 backdrop-blur shadow-xl">
						<CardContent className="pt-6">
							<h3 className="text-xl font-bold text-center text-slate-800 mb-4">
								Final Standings
							</h3>
							<div className="space-y-2">
								{gameState.results.leaderboard.map(
									(entry, index) => {
										const team = gameState.teams[entry.id];
										const rank = index + 1;
										const isMyTeam = entry.id === myTeamId;

										return (
											<motion.div
												key={entry.id}
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{
													delay: 1.2 + index * 0.1,
												}}
												className={`flex items-center justify-between p-3 rounded-lg transition-all ${
													isMyTeam
														? "bg-[#4A8B8B]/20 border-2 border-[#4A8B8B] shadow-md"
														: rank === 1
														? "bg-yellow-50 border border-yellow-200"
														: rank === 2
														? "bg-slate-50 border border-slate-200"
														: rank === 3
														? "bg-amber-50 border border-amber-200"
														: "bg-slate-50 border border-slate-200"
												}`}
											>
												<div className="flex items-center gap-3">
													{/* Rank Badge with Medal Emoji */}
													<div
														className={`flex items-center justify-center w-14 h-14 rounded-full font-bold text-xl ${
															rank === 1
																? "bg-yellow-400 text-yellow-900"
																: rank === 2
																? "bg-slate-300 text-slate-700"
																: rank === 3
																? "bg-amber-500 text-amber-900"
																: "bg-slate-200 text-slate-600"
														}`}
													>
														{rank === 1
															? "🥇"
															: rank === 2
															? "🥈"
															: rank === 3
															? "🥉"
															: `#${rank}`}
													</div>

													{/* Team Info */}
													<div>
														<div className="font-bold text-base text-slate-900">
															Team {entry.id} -{" "}
															{team.name}
														</div>
														{team.crop && (
															<div className="text-xs text-slate-600">
																{team.crop}
															</div>
														)}
													</div>
												</div>

												{/* Score */}
												<div className="text-right">
													<div className="text-xl font-bold text-slate-900">
														{entry.total}
													</div>
													<div className="text-xs text-slate-600">
														points
													</div>
												</div>
											</motion.div>
										);
									}
								)}
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</div>
	);
}
