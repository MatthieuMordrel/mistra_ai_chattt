import { ConversationService } from "@/db/services/conversation-service";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET handler for fetching a specific conversation with its messages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const conversationId = params.id;

    // Get the current user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Check if the user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the conversation with its messages
    const conversation = await ConversationService.getConversation(
      conversationId,
      session.user.id,
    );

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);

    // Check if it's a "not found" error
    if (error instanceof Error && error.message === "Conversation not found") {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 },
    );
  }
}
