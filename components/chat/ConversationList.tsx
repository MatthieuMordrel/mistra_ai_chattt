import { ConversationService } from "@/db/services/conversation-service";
import { ConversationSidebar } from "./ConversationSidebar";

export async function ConversationList({ userId }: { userId: string }) {
  // If no session, return empty sidebar
  if (!userId) {
    return <ConversationSidebar conversations={[]} />;
  }

  // Fetch conversations for the user
  const conversations = await ConversationService.getUserConversations(userId);

  return (
    <ConversationSidebar
      conversations={conversations.map((conv) => ({
        id: conv.id,
        title: conv.title,
        updatedAt: conv.updatedAt.toISOString(),
      }))}
    />
  );
}
