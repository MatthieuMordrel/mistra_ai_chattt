import { NextRequest } from "next/server";
import { tryCatchSync } from "../tryCatch";
import { SessionData } from "./types";

/**
 * Gets the session data from the request
 * Tries to get it from the x-session-data header (set by middleware)
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

  if (sessionDataHeader === null) {
    throw new Error(
      "Missing x-session-data header. Ensure middleware is properly configured.",
    );
  }

  // Use tryCatchSync for the synchronous JSON.parse operation which may error
  const { data: session, error } = tryCatchSync<SessionData>(() =>
    JSON.parse(decodeURIComponent(sessionDataHeader)),
  );

  if (error) {
    console.error("Error parsing session data from header:", error);
    throw new Error(`Failed to parse session data: ${error.message}`, {
      cause: error,
    });
  }

  return session;
}
