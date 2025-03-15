import { NextRequest, NextResponse } from "next/server";
import {
  handleApiRouteAuth,
  handlePublicRoutes,
} from "./lib/auth/middlewareFunctions";

/**
 * Middleware for handling authentication in Next.js
 *
 * This implementation follows the Better Auth recommendation for Next.js 15.1.7 and below:
 * - For public routes: Check if session cookie exists and redirect to dashboard if it does
 * - For protected API routes: Make an API call to our own /api/auth/get-session endpoint to validate the session
 *   and pass the session data to the API route via headers to avoid fetching it again
 */

// Main middleware function
export async function middleware(request: NextRequest) {
  // Check if the request is for an API route that needs authentication
  if (
    request.nextUrl.pathname.startsWith("/api/conversations") ||
    request.nextUrl.pathname.startsWith("/api/mistral") ||
    request.nextUrl.pathname.startsWith("/api/testauth")
  ) {
    return handleApiRouteAuth(request);
  }

  // For public routes (home or sign-in), check if user is already logged in
  if (
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname === "/sign-in"
  ) {
    return handlePublicRoutes(request);
  }

  // For other routes, proceed normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Public routes that redirect to dashboard if logged in
    "/",
    "/sign-in",
    // API routes that need authentication
    "/api/conversations/:path*",
    "/api/mistral/:path*",
    "/api/testauth",
  ],
};
