import { ConversationService } from "@/db/services/conversation-service";
import { ClientConversationList } from "./ClientConversationList";

export async function ConversationList({ userId }: { userId: string }) {
  // If no session, return empty sidebar
  if (!userId) {
    return null;
  }
  // Fetch conversation from the server using api/conversation
  const conversations = await ConversationService.getUserConversations(userId);
  // Format the conversations for the client
  const formattedConversations = conversations.map((conv) => ({
    id: conv.id,
    title: conv.title,
    updatedAt: conv.updatedAt.toISOString(),
  }));
  // Return the client-side wrapper
  return <ClientConversationList conversations={formattedConversations} />;
}
