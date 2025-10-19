import { NextRequest, NextResponse } from "next/server";
import { getAdminCredentials, setAdminCredentials } from "@/lib/gcs";

// GET - Get admin credentials
export async function GET() {
	try {
		const credentials = await getAdminCredentials();
		if (!credentials) {
			return NextResponse.json(
				{ error: "Admin credentials not found" },
				{ status: 404 }
			);
		}
		return NextResponse.json(credentials);
	} catch (error) {
		console.error("Error fetching admin credentials:", error);
		return NextResponse.json(
			{ error: "Failed to fetch admin credentials" },
			{ status: 500 }
		);
	}
}

// POST - Create/Update admin credentials
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { username, password } = body;

		if (!username || !password) {
			return NextResponse.json(
				{ error: "Username and password are required" },
				{ status: 400 }
			);
		}

		await setAdminCredentials({ username, password });
		return NextResponse.json(
			{ message: "Admin credentials saved successfully" },
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error saving admin credentials:", error);
		return NextResponse.json(
			{ error: "Failed to save admin credentials" },
			{ status: 500 }
		);
	}
}
