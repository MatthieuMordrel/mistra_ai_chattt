import { ConversationService } from "@/db/services/conversation-service";
import { getSessionFromRequest } from "@/lib/auth/getSessionFromRequest";
import { tryCatch } from "@/lib/tryCatch";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET handler for fetching all conversations for the current user
 *
 * Note: Authentication is now handled by middleware, which also passes the session data
 * in the x-session-data header to avoid fetching it again.
 */
export async function GET(request: NextRequest) {
  // Get the session using our utility function
  const sessionResult = await tryCatch(getSessionFromRequest(request));

  if (sessionResult.error) {
    console.error("Error getting session:", sessionResult.error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 },
    );
  }

  // Get conversations for the user
  const conversationsResult = await tryCatch(
    ConversationService.getUserConversations(sessionResult.data.user.id),
  );

  if (conversationsResult.error) {
    console.error("Error fetching conversations:", conversationsResult.error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 },
    );
  }

  // Format the conversations for the client
  const formattedConversations = conversationsResult.data.map((conv) => ({
    id: conv.id,
    title: conv.title,
    updatedAt: conv.updatedAt.toISOString(),
  }));

  return NextResponse.json(formattedConversations);
}
