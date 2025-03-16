import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";
import { sessionVerificationFunction } from "./sessionVerificationFunction";
import { SessionData } from "./types";

// Helper function to handle API route authentication
export async function handleApiRouteAuth(request: NextRequest) {
  try {
    // First, check if the session cookie exists at all
    const sessionCookie = getSessionCookie(request, {
      cookieName: "session_token",
      cookiePrefix: "better-auth",
    });

    // If no session cookie exists, return unauthorized immediately
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If the cookie exists, make an API call to validate the session
    // This will check if the session is valid and not expired
    const sessionResponse = await fetch(
      `${request.nextUrl.origin}/api/auth/get-session`,
      {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      },
    );

    // If the API call fails, return an error
    if (!sessionResponse.ok) {
      return NextResponse.json(
        { error: "Session validation failed" },
        { status: 401 },
      );
    }

    // Parse the session data
    const sessionData = (await sessionResponse.json()) as SessionData;

    // Check if the session is valid
    if (!sessionVerificationFunction(sessionData)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If session is valid, proceed with the request
    // In Next.js middleware, we can't directly modify the request that will be passed to the API route
    // Instead, we need to use a different approach:

    // 1. Create a new request headers object with our session data
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(
      "x-session-data",
      encodeURIComponent(JSON.stringify(sessionData)),
    );

    // 2. Use NextResponse.next() with the request option to create a new request with our headers
    const response = NextResponse.next({
      request: {
        // This creates a new request with our modified headers
        headers: requestHeaders,
      },
    });

    return response;
  } catch (error) {
    console.error("API middleware authentication error:", error);
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 },
    );
  }
}

// Helper function to handle public routes
export function handlePublicRoutes(request: NextRequest) {
  const sessionCookie = getSessionCookie(request, {
    cookieName: "session_token",
    cookiePrefix: "better-auth",
  });

  if (sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}
