import { revalidatePath } from "next/cache";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  revalidatePath(`/dashboard/chat/${id}`);
  return NextResponse.json({ message: "Conversation revalidated" });
}
