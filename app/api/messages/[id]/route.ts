import { DAL } from "@/db/dal";
import { withAuth } from "@/lib/auth/withAuth";
import { tryCatch } from "@/lib/tryCatch";
import { NextResponse } from "next/server";

/**
 * GET handler for fetching a specific conversation with its messages
 * Protected by withAuth HOF
 */
export const GET = withAuth(async (session, request, context) => {
  // Await the params Promise to get the actual values
  const params = await context.params;
  const conversationId = params.id;

  if (!conversationId) {
    return NextResponse.json(
      { error: "Conversation ID is required" },
      { status: 400 },
    );
  }

  // Get the conversation with its messages
  const { data: messages, error: conversationError } = await tryCatch(
    DAL.conversation.queries.getConversationMessages(
      conversationId,
      session.user.id,
    )(),
  );

  if (conversationError) {
    console.error("Error fetching messages:", conversationError);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 },
    );
  }

  return NextResponse.json(messages);
});
