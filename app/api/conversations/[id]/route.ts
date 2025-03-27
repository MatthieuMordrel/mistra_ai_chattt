import { ConversationService } from "@/db/services/conversation-service";
import { getSessionFromRequest } from "@/lib/auth/getSessionFromRequest";
import { tryCatch } from "@/lib/tryCatch";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET handler for fetching a specific conversation with its messages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: conversationId } = await params;

  // Get the current user session
  const sessionResult = await tryCatch(getSessionFromRequest(request));

  if (sessionResult.error) {
    console.error("Error getting session:", sessionResult.error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 },
    );
  }

  // Get the conversation with its messages
  const { data: conversation, error: conversationError } = await tryCatch(
    ConversationService.getConversation(
      conversationId,
      sessionResult.data.user.id,
    ),
  );

  if (conversationError) {
    console.error("Error fetching conversation:", conversationError);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 },
    );
  }

  return NextResponse.json(conversation);
}
