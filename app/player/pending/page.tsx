"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/lib/game-context";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Coins, Sprout, Users, Leaf } from "lucide-react";

export default function PendingPage() {
	const router = useRouter();
	const { gameState } = useGame();

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

	// Redirect to scenario page when game starts
	useEffect(() => {
		if (gameState.phase === "running" && gameState.scenarioIndex >= 0) {
			router.push("/player/scenario");
		}
	}, [gameState.phase, gameState.scenarioIndex, router]);

	// Redirect to team selection if no team claimed
	useEffect(() => {
		if (!myTeamId) {
			router.push("/player");
		}
	}, [myTeamId, router]);

	if (!myTeam) {
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
				</div>
			</div>
		);
	}

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
						Team {myTeam.id}
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
								{myTeam.name || "Loading..."}
							</span>
						</div>

						{/* Crop */}
						<div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
							<span className="text-base font-semibold text-slate-700 flex items-center gap-2">
								<Leaf className="w-4 h-4 text-green-600" />
								Crop:
							</span>
							<span className="text-base font-bold text-slate-900">
								{myTeam.crop || "Loading..."}
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
									{myTeam.coins ?? 1000}
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
									{myTeam.crops ?? 10}
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
