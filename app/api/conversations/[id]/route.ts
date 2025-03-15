import { ConversationService } from "@/db/services/conversation-service";
import { validateServerSession } from "@/lib/validateSession";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET handler for fetching a specific conversation with its messages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const conversationId = id;

    // Get the current user session
    const session = await validateServerSession();

    // Check if the user is authenticated
    if (!session || session.session.expiresAt < new Date()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the conversation with its messages
    const conversation = await ConversationService.getConversation(
      conversationId,
      session.session.userId,
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
