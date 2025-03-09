import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Add cache control headers to prevent continuous requests
    const response = NextResponse.json(session);
    response.headers.set("Cache-Control", "private, max-age=30");

    return response;
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(null, { status: 500 });
  }
}
