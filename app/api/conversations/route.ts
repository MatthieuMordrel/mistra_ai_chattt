import { ConversationService } from "@/db/services/conversation-service";
import { getSessionFromRequest } from "@/lib/auth/getSessionFromRequest";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET handler for fetching all conversations for the current user
 *
 * Note: Authentication is now handled by middleware, which also passes the session data
 * in the x-session-data header to avoid fetching it again.
 */
export async function GET(request: NextRequest) {
  try {
    // Get the session using our utility function
    const { user } = await getSessionFromRequest(request);

    // Fetch conversations for the user
    const conversations = await ConversationService.getUserConversations(
      user.id,
    );

    // Format the conversations for the client
    const formattedConversations = conversations.map((conv) => ({
      id: conv.id,
      title: conv.title,
      updatedAt: conv.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 },
    );
  }
}
