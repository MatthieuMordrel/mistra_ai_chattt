import { auth } from "../lib/auth/config/auth";

/**
 * Type for the session object returned by Better Auth
 * Uses the $Infer utility from Better Auth to ensure type safety
 */
export type SessionData = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;

/**
 * Type for the user object in the session
 */
export type SessionUser = SessionData["user"];
