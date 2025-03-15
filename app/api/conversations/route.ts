import { ConversationService } from "@/db/services/conversation-service";
import { validateServerSession } from "@/lib/validateSession";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET handler for fetching all conversations for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await validateServerSession();

    // Check if user is authenticated
    if (!session || session.session.expiresAt < new Date()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch conversations for the user
    const conversations = await ConversationService.getUserConversations(
      session.session.userId,
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
