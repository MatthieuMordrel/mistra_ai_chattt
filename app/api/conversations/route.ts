import { DAL } from "@/db/dal";
import { withAuth } from "@/lib/auth/withAuth";
import { tryCatch } from "@/lib/tryCatch";
import { NextResponse } from "next/server";

/**
 * GET handler for fetching all conversations for the current user
 * Protected by withAuth HOF
 */
export const GET = withAuth(async (session, request) => {
  // Get conversations for the user
  const { data: conversations, error: conversationsError } = await tryCatch(
    DAL.conversation.queries.getUserConversations(session.user.id),
  );

  if (conversationsError) {
    console.error("Error fetching conversations:", conversationsError);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 },
    );
  }

  // Format the conversations for the client
  const formattedConversations = conversations.map((conv) => ({
    id: conv.id,
    title: conv.title,
    updatedAt: conv.updatedAt.toISOString(),
  }));

  return NextResponse.json(formattedConversations);
});
