import { NextRequest, NextResponse } from "next/server";
import { getTeam, saveTeam } from "@/lib/gcs";

// GET - Get team data
export async function GET(
	request: NextRequest,
	{ params }: { params: { teamId: string } }
) {
	try {
		const teamId = params.teamId;
		const team = await getTeam(teamId);

		if (!team) {
			return NextResponse.json(
				{ error: "Team not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(team);
	} catch (error) {
		console.error(`Error fetching team ${params.teamId}:`, error);
		return NextResponse.json(
			{ error: "Failed to fetch team data" },
			{ status: 500 }
		);
	}
}

// POST - Create team
export async function POST(
	request: NextRequest,
	{ params }: { params: { teamId: string } }
) {
	try {
		const teamId = params.teamId;
		const teamData = await request.json();

		await saveTeam(teamId, { ...teamData, id: teamId });
		return NextResponse.json(
			{ message: "Team created successfully" },
			{ status: 201 }
		);
	} catch (error) {
		console.error(`Error creating team ${params.teamId}:`, error);
		return NextResponse.json(
			{ error: "Failed to create team" },
			{ status: 500 }
		);
	}
}

// PUT - Update team
export async function PUT(
	request: NextRequest,
	{ params }: { params: { teamId: string } }
) {
	try {
		const teamId = params.teamId;
		const teamData = await request.json();

		await saveTeam(teamId, { ...teamData, id: teamId });
		return NextResponse.json(
			{ message: "Team updated successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error(`Error updating team ${params.teamId}:`, error);
		return NextResponse.json(
			{ error: "Failed to update team" },
			{ status: 500 }
		);
	}
}

// DELETE - Delete team
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { teamId: string } }
) {
	try {
		const teamId = params.teamId;
		// Delete by saving empty/reset data
		await saveTeam(teamId, {
			id: teamId,
			coins: 1000,
			crops: 10,
			answers: {},
		});

		return NextResponse.json(
			{ message: "Team deleted successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error(`Error deleting team ${params.teamId}:`, error);
		return NextResponse.json(
			{ error: "Failed to delete team" },
			{ status: 500 }
		);
	}
}
