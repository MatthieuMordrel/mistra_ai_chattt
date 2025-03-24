"server-only";

/**
 * List of whitelisted email addresses that are allowed to access the application
 * This file is server-only and cannot be imported on the client side
 */
export const whitelistedEmails = [
  "matthieujda08@gmail.com",
  "aleksandra.livinskaia@gmail.com",
  "matthieumordrel@gmail.com",
] as const;

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
  return whitelistedEmails.includes(email as WhitelistedEmail);
}
