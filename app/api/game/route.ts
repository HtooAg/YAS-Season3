import { NextRequest, NextResponse } from "next/server";
import { getGameState, saveGameState, resetGameData } from "@/lib/gcs";

// GET - Get game state
export async function GET() {
	try {
		const gameState = await getGameState();
		if (!gameState) {
			return NextResponse.json(
				{ error: "Game state not found" },
				{ status: 404 }
			);
		}
		return NextResponse.json(gameState);
	} catch (error) {
		console.error("Error fetching game state:", error);
		return NextResponse.json(
			{ error: "Failed to fetch game state" },
			{ status: 500 }
		);
	}
}

// POST - Save game state
export async function POST(request: NextRequest) {
	try {
		const gameData = await request.json();
		await saveGameState(gameData);
		return NextResponse.json(
			{ message: "Game state saved successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error saving game state:", error);
		return NextResponse.json(
			{ error: "Failed to save game state" },
			{ status: 500 }
		);
	}
}

// PUT - Update game state
export async function PUT(request: NextRequest) {
	try {
		const gameData = await request.json();
		await saveGameState(gameData);
		return NextResponse.json(
			{ message: "Game state updated successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error updating game state:", error);
		return NextResponse.json(
			{ error: "Failed to update game state" },
			{ status: 500 }
		);
	}
}

// DELETE - Reset game
export async function DELETE() {
	try {
		await resetGameData();
		return NextResponse.json(
			{ message: "Game reset successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error resetting game:", error);
		return NextResponse.json(
			{ error: "Failed to reset game" },
			{ status: 500 }
		);
	}
}
