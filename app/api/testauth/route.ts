// Query using http://localhost:3001/api/testauth
import { auth } from "@/lib/auth"; // Import Better Auth instance
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// Protect the API route with auth()
export const GET = async (req: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  // Check if user is authenticated
  if (session) {
    return NextResponse.json({
      message: "You have access!",
      user: session.user, // Authenticated user's details
    });
  }

  // Return 401 Unauthorized if not logged in
  return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
};
