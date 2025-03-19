import { ConversationService } from "@/db/services/conversation-service";
import { getQueryClient } from "@/providers/QueryProvider";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ConversationSidebar } from "./ConversationSidebar";

export async function ConversationsSidebar({ userId }: { userId: string }) {
  // If no session, return empty sidebar
  if (!userId) {
    return null;
  }
  const queryClient = getQueryClient();

  // Prefetch the conversations data on the server
  const conversations = await ConversationService.getUserConversations(userId);

  await queryClient.prefetchQuery({
    queryKey: ["conversations"],
    queryFn: () => conversations,
  });

  const conversationsServer = conversations.map((conv) => ({
    id: conv.id,
    title: conv.title,
    updatedAt: conv.updatedAt.toISOString(),
  }));

  // Return the client-side wrapper with the dehydrated state
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ConversationSidebar conversationsServer={conversationsServer} />
    </HydrationBoundary>
  );
}
