"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useGame } from "@/lib/game-context";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

export function ResetNotification() {
	const router = useRouter();
	const pathname = usePathname();
	const { gameState } = useGame();
	const [showResetNotification, setShowResetNotification] = useState(false);
	const [previousPhase, setPreviousPhase] = useState(gameState.phase);
	const [wasInGame, setWasInGame] = useState(false);
	const isInitialMount = useRef(true);

	const isPlayer = pathname === "/player";

	useEffect(() => {
		// Skip on initial mount
		if (isInitialMount.current) {
			isInitialMount.current = false;
			setPreviousPhase(gameState.phase);
			// Check if user was already in a game (has claimed a team)
			const myTeamId = sessionStorage.getItem("yas-harvest-team-id");
			if (myTeamId) {
				setWasInGame(true);
			}
			return;
		}

		// Track if user is in a game
		if (gameState.phase === "running" || gameState.phase === "finished") {
			setWasInGame(true);
		}

		// Detect reset: phase changed to lobby AND all teams are unclaimed AND user was in a game
		if (
			isPlayer &&
			gameState.phase === "lobby" &&
			previousPhase !== "lobby"
		) {
			const allTeamsUnclaimed = Object.values(gameState.teams).every(
				(team) => !team.claimedBy
			);

			// Only show notification if user was in a game and now all teams are unclaimed
			if (allTeamsUnclaimed && wasInGame) {
				setShowResetNotification(true);
				setWasInGame(false); // Reset the flag
			}
		}

		setPreviousPhase(gameState.phase);
	}, [gameState.phase, isPlayer, previousPhase, wasInGame, gameState.teams]);

	const handleOk = () => {
		setShowResetNotification(false);
		// Redirect to player page (refresh)
		router.push("/player");
		router.refresh();
	};

	return (
		<AlertDialog
			open={showResetNotification}
			onOpenChange={setShowResetNotification}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle className="flex items-center gap-2 text-xl">
						<AlertTriangle className="w-6 h-6 text-amber-500" />
						Game Has Been Reset
					</AlertDialogTitle>
					<AlertDialogDescription className="text-base pt-2">
						The admin has reset the game. All progress has been
						cleared and teams need to rejoin.
						<br />
						<br />
						Click OK to return to the team selection page.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogAction
						onClick={handleOk}
						className="bg-gradient-to-r from-[#4A8B8B] to-[#5FABA8] hover:from-[#3A7575] hover:to-[#4A8B8B] text-white"
					>
						OK
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
