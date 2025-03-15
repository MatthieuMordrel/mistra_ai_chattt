import { ConversationService } from "@/db/services/conversation-service";
import { getQueryClient } from "@/providers/QueryProvider";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ClientConversationList } from "./ClientConversationList";

export async function ConversationsSidebar({ userId }: { userId: string }) {
  // If no session, return empty sidebar
  if (!userId) {
    return null;
  }
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["conversations"],
    queryFn: () => ConversationService.getUserConversations(userId),
  });
  // Return the client-side wrapper
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientConversationList />
    </HydrationBoundary>
  );
}
