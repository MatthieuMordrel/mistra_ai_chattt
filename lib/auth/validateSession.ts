import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

/**
 * Validates the user session on the server side
 * Make the page dynamic since uses headers
 * @param redirectPath Path to redirect to if session is invalid
 * @returns If redirectPath is provided, the function will redirect to the sign-in page if the session is invalid
 * @returns If redirectPath is not provided, the function will return the session object which might be null
 */
// Function overloads to properly type the return value
export async function validateServerSession(
  redirectPath: string,
): Promise<NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>>;
export async function validateServerSession(
  redirectPath?: undefined,
): Promise<Awaited<ReturnType<typeof auth.api.getSession>>>;
export async function validateServerSession(redirectPath?: string) {
  // Get the session from auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect if not authenticated or session expired
  if (redirectPath && (!session || session.session.expiresAt < new Date())) {
    redirect(redirectPath);
  }

  return session;
}
