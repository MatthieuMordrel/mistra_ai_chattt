import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";
import { tryCatchSync } from "../tryCatch";

// Helper function to check if session cookie exists (lightweight)
function hasSessionCookie(request: NextRequest): boolean {
  const sessionCookie = getSessionCookie(request);

  return !!sessionCookie;
}

// Helper function to handle API route authentication
// Only checks for cookie presence, actual validation happens in the route handler
export async function handleApiRouteAuth(request: NextRequest) {
  const { data, error } = tryCatchSync(() => {
    if (!hasSessionCookie(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Let the request proceed to the route handler
    // where proper validation will happen with withAuth
    return NextResponse.next();
  });

  if (error) {
    console.error("API middleware authentication error:", error);
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 },
    );
  }

  return data;
}

// Helper function to handle public routes
export async function handlePublicRoutes(request: NextRequest) {
  // Only check for cookie existence - don't validate it yet
  // The validation happens in the resource that is being requested
  if (hasSessionCookie(request)) {
    const baseUrl = process.env.BETTER_AUTH_URL || request.nextUrl.origin;
    // Always use absolute URLs for redirects in middleware
    return NextResponse.redirect(new URL("/dashboard/home", baseUrl));
  }

  return NextResponse.next();
}
