import "server-only";

import { db } from "@/db/database";
import { user } from "@/db/schema/auth-schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { forbidden, unauthorized } from "next/navigation";
import { cache } from "react";
import { tryCatch } from "../tryCatch";
import { auth } from "./config/auth";
import { sessionVerificationFunction } from "./verificationFunction";

/** Whether to skip authentication in development mode */
const SKIP_AUTH_IN_DEV = process.env.NODE_ENV === "development";

/** Dev user ID - used for development without authentication */
const DEV_USER_ID = "dev-user-id";

/** Flag to track if dev user has been ensured this session */
let devUserEnsured = false;

/**
 * Ensures the dev user exists in the database for foreign key constraints
 * Only runs once per server session
 */
async function ensureDevUserExists() {
  if (devUserEnsured) return;

  const now = new Date();
  const existingUser = await db
    .select()
    .from(user)
    .where(eq(user.id, DEV_USER_ID))
    .limit(1);

  if (existingUser.length === 0) {
    await db.insert(user).values({
      id: DEV_USER_ID,
      name: "Dev User",
      email: "dev@localhost",
      emailVerified: true,
      image: null,
      createdAt: now,
      updatedAt: now,
    });
    console.log("Created dev user in database");
  }

  devUserEnsured = true;
}

/**
 * Creates a mock session for development mode
 * @returns Mock session data that mimics a real authenticated session
 */
async function createDevSession(): Promise<
  NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>
> {
  // Ensure dev user exists in database for foreign key constraints
  await ensureDevUserExists();

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

  return {
    user: {
      id: DEV_USER_ID,
      name: "Dev User",
      email: "dev@localhost",
      emailVerified: true,
      image: null,
      createdAt: now,
      updatedAt: now,
    },
    session: {
      id: "dev-session-id",
      userId: DEV_USER_ID,
      token: "dev-token",
      expiresAt,
      createdAt: now,
      updatedAt: now,
      ipAddress: "127.0.0.1",
      userAgent: "Development",
    },
  };
}

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

  // In development mode, return a mock session
  if (SKIP_AUTH_IN_DEV) {
    return { session: await createDevSession(), headers: headersList };
  }

  // Get the session from auth
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    await tryCatch(auth.api.signOut({ headers: headersList }));
    console.log("user couldn't be authenticated");
    unauthorized();
  }

  //Check if session is valid
  const validSession = sessionVerificationFunction(session);

  if (!validSession) {
    //For some reason, the signOut function does not work on the server and doesn't delete the session cookie
    await tryCatch(auth.api.signOut({ headers: headersList }));
    console.log("user doesn't have access to this resource");
    forbidden();
  }

  //If session is valid, return the session and headers
  return { session, headers: headersList };
}

//Cache the validateserverSession
export const cachedValidateServerSession = cache(validateServerSession);
