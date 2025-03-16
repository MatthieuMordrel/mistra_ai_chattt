import { SessionData } from "./types";

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
    (session.user.email !== "matthieujda08@gmail.com" &&
      session.user.email !== "aleksandra.livinskaia@gmail.com")
  ) {
    return false;
  }
  return true;
}
