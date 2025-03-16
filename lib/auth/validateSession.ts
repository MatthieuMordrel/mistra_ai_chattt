import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "./auth";
import { sessionVerificationFunction } from "./sessionVerificationFunction";
/**
 * Validates the user session on the server side
 * Make the page dynamic since uses headers
 * @param redirectPath Path to redirect to if session is invalid
 * @returns Object containing session and headers. If redirectPath is provided and session is invalid, redirects instead
 */
// Function overloads to properly type the return value
export async function validateServerSession(redirectPath: string): Promise<{
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
  headers: Headers;
}>;
export async function validateServerSession(redirectPath?: undefined): Promise<{
  session: Awaited<ReturnType<typeof auth.api.getSession>>;
  headers: Headers;
}>;
export async function validateServerSession(redirectPath?: string) {
  const headersList = await headers();

  // Get the session from auth
  const session = await auth.api.getSession({
    headers: headersList,
  });

  // Redirect if not authenticated or session expired
  if (redirectPath && !sessionVerificationFunction(session)) {
    redirect(redirectPath);
  }

  return { session, headers: headersList };
}

//Cache the validateserverSession
export const cachedValidateServerSession = cache(validateServerSession);
