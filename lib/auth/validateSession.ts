import "server-only";

import { headers } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import { cache } from "react";
import { tryCatch } from "../tryCatch";
import { auth } from "./config/auth";
import { HttpError } from "./errors";
import { sessionVerificationFunction } from "./verificationFunction";
/**
 * Validates the user session on the server side
 * Make the page dynamic since uses headers
 * @param redirectPath Path to redirect to if session is invalid
 * @returns Object containing session and headers. If redirectPath is provided and session is invalid, redirects instead
 * @throws HttpError if session is invalid and redirectPath is not provided
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
  console.log("validateServerSession");
  const headersList = await headers();

  // Get the session from auth
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    if (redirectPath) {
      const result = await tryCatch(auth.api.signOut({ headers: headersList }));
      if (result.error) {
        //If there is an error when signing out, return a forbidden error to avoid infinite redirect
        forbidden();
      }
      redirect(redirectPath);
    }
    throw new HttpError("Invalid session", 403);
  }

  //Check if session is valid
  const validSession = sessionVerificationFunction(session);

  if (!validSession) {
    // When session is invalid, redirect to sign-in with a special query param
    // that will trigger cookie cleanup in the route handler
    if (redirectPath) {
      const result = await tryCatch(auth.api.signOut({ headers: headersList }));
      if (result.error) {
        //If there is an error when signing out, return a forbidden error to avoid infinite redirect
        forbidden();
      }
      redirect(redirectPath);
    }
    throw new HttpError("Invalid session", 403);
  }

  //If session is valid, return the session and headers
  return { session, headers: headersList };
}

//Cache the validateserverSession
export const cachedValidateServerSession = cache(validateServerSession);
