import { SessionData } from "./types";
import { isEmailWhitelisted } from "./whitelist";

/**
 * Verifies the session data
 * @param session - The session data
 * @returns true if the session is valid, false otherwise
 */
export function sessionVerificationFunction(
  session: SessionData | null,
): boolean {
  if (
    !session ||
    session.session.expiresAt < new Date() ||
    !isEmailWhitelisted(session.user.email)
  ) {
    return false;
  }
  return true;
}
