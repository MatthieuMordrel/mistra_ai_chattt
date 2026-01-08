"server-only";

import { SessionData } from "../../types/auth";

/** Maximum number of messages a user can send */
export const MAX_USER_MESSAGES = 100;

/**
 * Verifies the session data
 * @param session - The session data
 * @returns true if the session is valid, false otherwise
 */
export function sessionVerificationFunction(
  session: SessionData | null,
): boolean {
  // Only check if session exists and is not expired
  if (!session || session.session.expiresAt < new Date()) {
    return false;
  }
  return true;
}
