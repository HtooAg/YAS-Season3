"use client";

import { useGame } from "@/lib/game-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Sprout, StickyNote } from "lucide-react";

export function TeamNotes() {
	const { gameState } = useGame();

	const claimedTeams = Object.values(gameState.teams).filter(
		(t) => t.claimedBy
	);

	if (claimedTeams.length === 0) return null;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<StickyNote className="w-5 h-5 text-[#4A8B8B]" />
					Team Status
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{claimedTeams.map((team) => (
						<div
							key={team.id}
							className="p-4 rounded-lg border border-slate-200 bg-slate-50"
						>
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center gap-2">
									<Badge className="bg-gradient-to-r from-[#4A8B8B] to-[#5FABA8] text-white border-0">
										Team {team.id}
									</Badge>
									<span className="font-semibold text-slate-900">
										{team.name}
									</span>
								</div>
								<div className="flex items-center gap-4 text-sm">
									<div className="flex items-center gap-1">
										<Coins className="w-4 h-4 text-[#4A8B8B]" />
										<span className="font-medium">
											{team.coins}
										</span>
									</div>
									<div className="flex items-center gap-1">
										<Sprout className="w-4 h-4 text-green-500" />
										<span className="font-medium">
											{team.crops}
										</span>
									</div>
								</div>
							</div>
							{team.notes && (
								<div className="text-sm text-slate-600 bg-white p-3 rounded border border-slate-200">
									{team.notes}
								</div>
							)}
							{!team.notes && (
								<div className="text-sm text-slate-400 italic">
									No notes yet
								</div>
							)}
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
