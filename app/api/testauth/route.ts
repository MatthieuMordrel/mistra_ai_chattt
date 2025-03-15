// Query using http://localhost:3001/api/testauth
import { getSessionFromRequest } from "@/lib/auth/getSessionFromRequest";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET handler for testing session passing from middleware
 */
export async function GET(request: NextRequest) {
  try {
    // Get the session using our utility function
    const { user } = await getSessionFromRequest(request);

    // Return the session data (excluding sensitive information)
    return NextResponse.json({
      message: "Session successfully retrieved",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      // This field indicates whether the session was retrieved from the middleware header
      // or had to be fetched directly using validateServerSession
      sessionSource: request.headers.has("x-session-data")
        ? "middleware"
        : "direct-fetch",
    });
  } catch (error) {
    console.error("Error in test auth route:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
