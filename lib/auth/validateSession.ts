import "server-only";

import { headers } from "next/headers";
import { forbidden, unauthorized } from "next/navigation";
import { cache } from "react";
import { tryCatch } from "../tryCatch";
import { auth } from "./config/auth";
import { sessionVerificationFunction } from "./verificationFunction";
/**
 * Validates the user session on the server side
 * Make the page dynamic since uses headers
 * @param redirectPath Path to redirect to if session is invalid
 * @returns Object containing session and headers. If redirectPath is provided and session is invalid, redirects instead
 * @throws HttpError if session is invalid and redirectPath is not provided
 */
// Function overloads to properly type the return value
export async function validateServerSession(redirect?: boolean): Promise<{
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
  headers: Headers;
}>;
export async function validateServerSession(redirect?: undefined): Promise<{
  session: Awaited<ReturnType<typeof auth.api.getSession>>;
  headers: Headers;
}>;
export async function validateServerSession(redirect?: boolean) {
  const headersList = await headers();

  // Get the session from auth
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    await tryCatch(auth.api.signOut({ headers: headersList }));
    unauthorized();
  }

  //Check if session is valid
  const validSession = sessionVerificationFunction(session);

  if (!validSession) {
    //For some reason, the signOut function does not work on the server and doesn't delete the session cookie
    await tryCatch(auth.api.signOut({ headers: headersList }));
    forbidden();
  }

  //If session is valid, return the session and headers
  return { session, headers: headersList };
}

//Cache the validateserverSession
export const cachedValidateServerSession = cache(validateServerSession);
