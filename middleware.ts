import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request, {
    // Optionally pass config if cookie name, prefix or useSecureCookies option is customized in auth config.
    cookieName: "session_token",
    cookiePrefix: "better-auth",
  });

  if (sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/sign-in"], // Specify the routes the middleware applies to
};
