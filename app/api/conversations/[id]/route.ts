import { ConversationService } from "@/db/services/conversation-service";
import { getSessionFromRequest } from "@/lib/auth/getSessionFromRequest";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET handler for fetching a specific conversation with its messages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: conversationId } = await params;

    // Get the current user session
    const { user } = await getSessionFromRequest(request);

    // Get the conversation with its messages
    const conversation = await ConversationService.getConversation(
      conversationId,
      user.id,
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
