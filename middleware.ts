import { NextRequest, NextResponse } from "next/server";
import {
  handleApiRouteAuth,
  handlePublicRoutes,
} from "./lib/auth/middlewareFunctions";

/**
 * Middleware for handling authentication in Next.js
 */

// Main middleware function
export async function middleware(request: NextRequest) {
  // Check if the request is for an API route that needs authentication
  if (
    request.nextUrl.pathname.startsWith("/api/conversations") ||
    request.nextUrl.pathname.startsWith("/api/mistral")
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
    // Public routes that redirect to dashboard/home if logged in
    "/",
    "/sign-in",
    // API routes that need authentication
    "/api/conversations/:path*",
    "/api/mistral/:path*",
  ],
};
