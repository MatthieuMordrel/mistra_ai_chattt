import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

/**
 * Validates the user session on the server side
 * Make the page dynamic since uses headers
 * @param redirectPath Path to redirect to if session is invalid
 * @returns The valid session object or redirects to the sign-in page
 */
export async function validateServerSession(redirectPath: string = "/sign-in") {
  // Get the session from auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect if not authenticated or session expired
  if (!session || session.session.expiresAt < new Date()) {
    redirect(redirectPath);
  }

  return session;
}
