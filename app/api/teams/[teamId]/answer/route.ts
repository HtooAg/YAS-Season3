import { NextRequest, NextResponse } from "next/server";
import { saveScenarioAnswer, getTeam, saveTeam } from "@/lib/gcs";

// POST - Submit answer for a scenario
export async function POST(
	request: NextRequest,
	{ params }: { params: { teamId: string } }
) {
	try {
		const teamId = params.teamId;
		const { scenarioIndex, choiceId } = await request.json();

		if (scenarioIndex === undefined || !choiceId) {
			return NextResponse.json(
				{ error: "scenarioIndex and choiceId are required" },
				{ status: 400 }
			);
		}

		const answer = {
			choiceId,
			timestamp: Date.now(),
		};

		// Save the answer
		await saveScenarioAnswer(teamId, scenarioIndex, answer);

		// Update team data with the answer
		const team = await getTeam(teamId);
		if (team) {
			team.answers[scenarioIndex] = answer;
			await saveTeam(teamId, team);
		}

		return NextResponse.json(
			{ message: "Answer submitted successfully", answer },
			{ status: 200 }
		);
	} catch (error) {
		console.error(
			`Error submitting answer for team ${params.teamId}:`,
			error
		);
		return NextResponse.json(
			{ error: "Failed to submit answer" },
			{ status: 500 }
		);
	}
}
