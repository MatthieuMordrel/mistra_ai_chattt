import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  // Delete the session cookie
  const cookieStore = await cookies();
  cookieStore.delete("better-auth.session_token");

  // Return a success response
  return NextResponse.json({ success: true });
}
