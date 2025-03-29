"server-only";

import { SessionData } from "../../types/auth";

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

/**
 * List of whitelisted email addresses that are allowed to access the application
 * This file is server-only and cannot be imported on the client side
 */
export const whitelistedEmails = (process.env.WHITELISTED_EMAILS || "")
  .split(",")
  .map((email) => email.trim()) as readonly string[];

/**
 * Type for whitelisted emails
 */
export type WhitelistedEmail = (typeof whitelistedEmails)[number];

/**
 * Checks if an email is whitelisted
 * @param email The email to check
 * @returns true if the email is whitelisted, false otherwise
 */
export function isEmailWhitelisted(email: string): boolean {
  if (!whitelistedEmails.length) {
    console.warn(
      "No whitelisted emails configured. Please set WHITELISTED_EMAILS environment variable.",
    );
    return false;
  }
  return whitelistedEmails.includes(email as WhitelistedEmail);
}
