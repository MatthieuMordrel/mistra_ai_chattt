import { ConversationService } from "@/db/services/conversation-service";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET handler for fetching all conversations for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // Get the session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch conversations for the user
    const conversations = await ConversationService.getUserConversations(
      session.user.id,
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
