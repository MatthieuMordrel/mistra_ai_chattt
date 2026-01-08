import { getSessionCookie } from "better-auth/cookies";
import { unauthorized } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

// Only checks for cookie presence, actual validation happens in the route handler
export async function handleApiRouteAuth(request: NextRequest) {
  // If there is no session cookie, redirect to sign-in
  if (!getSessionCookie(request)) {
    unauthorized();
  }

  // If there is a session cookie, let the request proceed to the route handler
  // If the session cookie is invalid, validateSession will manage the redirect/error
  return NextResponse.next();
}

// Helper function to handle public routes
export async function handlePublicRoutes(request: NextRequest) {
  // If there is a session cookie, redirect to dashboard/home
  if (!!getSessionCookie(request)) {
    // Always use absolute URLs for redirects in proxy
    const baseUrl = process.env.BETTER_AUTH_URL || request.nextUrl.origin;
    return NextResponse.redirect(new URL("/dashboard/home", baseUrl));
  }

  // If there is no session cookie, let the request proceed normally
  return NextResponse.next();
}
