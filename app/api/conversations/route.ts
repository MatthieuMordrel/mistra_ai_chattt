import { ConversationService } from "@/db/services/conversation-service";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET handler for fetching all conversations for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Check if the user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all conversations for the user
    const conversations = await ConversationService.getUserConversations(
      session.user.id,
    );

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 },
    );
  }
}
