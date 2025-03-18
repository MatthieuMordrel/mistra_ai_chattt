import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";
import { sessionVerificationFunction } from "./sessionVerificationFunction";
import { SessionData } from "./types";

// Helper function to validate session
async function validateSession(request: NextRequest) {
  // Check if the session cookie exists
  const sessionCookie = getSessionCookie(request, {
    cookieName: "session_token",
    cookiePrefix: "better-auth",
  });

  // If no session cookie exists, return null
  if (!sessionCookie) {
    return null;
  }

  try {
    // Make an API call to validate the session
    const sessionResponse = await fetch(
      `${request.nextUrl.origin}/api/auth/get-session`,
      {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      },
    );

    // If the API call fails, return null
    if (!sessionResponse.ok) {
      return null;
    }

    // Parse the session data
    const sessionData = (await sessionResponse.json()) as SessionData;

    // Check if the session is valid using the verification function
    if (!sessionVerificationFunction(sessionData)) {
      return null;
    }

    return sessionData;
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
}

// Helper function to handle API route authentication
export async function handleApiRouteAuth(request: NextRequest) {
  try {
    const sessionData = await validateSession(request);

    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create a new request headers object with our session data
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(
      "x-session-data",
      encodeURIComponent(JSON.stringify(sessionData)),
    );

    // Use NextResponse.next() with the request option
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("API middleware authentication error:", error);
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 },
    );
  }
}

// Helper function to handle public routes
export async function handlePublicRoutes(request: NextRequest) {
  const sessionData = await validateSession(request);

  if (sessionData) {
    return NextResponse.redirect(new URL("/dashboard/home", request.url));
  }

  return NextResponse.next();
}
