import { NextRequest } from "next/server";
import { SessionData } from "./types";
import { validateServerSession } from "./validateSession";

/**
 * Gets the session data from the request
 * First tries to get it from the x-session-data header (set by middleware)
 * Falls back to validateServerSession if the header is not present or invalid
 *
 * Since middleware already validates the session, this function should never return null
 * in API routes protected by middleware. The null check is only for type safety.
 *
 * @param request The Next.js request object
 * @returns The session data (guaranteed to be non-null in middleware-protected routes)
 * @throws Error if session cannot be retrieved (should never happen in middleware-protected routes)
 */
export async function getSessionFromRequest(
  request: NextRequest,
): Promise<SessionData> {
  // Try to get the session data from the middleware
  const sessionDataHeader = request.headers.get("x-session-data");

  // If the session data is in the header, parse it
  if (sessionDataHeader) {
    try {
      const session = JSON.parse(
        decodeURIComponent(sessionDataHeader),
      ) as SessionData;
      return session;
    } catch (e) {
      console.error("Error parsing session data from header:", e);
      // Continue to fallback
    }
  }

  // If we couldn't get the session from the header, fall back to validateServerSession
  const { session } = await validateServerSession();

  // In middleware-protected routes, this should never be null
  // But we check anyway for type safety and to handle unexpected errors
  if (!session) {
    throw new Error("Failed to retrieve session data");
  }

  return session;
}
