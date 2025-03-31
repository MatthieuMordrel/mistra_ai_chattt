import { DAL } from "@/db/dal";
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
  const conversations =
    await DAL.conversation.queries.getUserConversations(userId);

  // Prefetch the conversations data on the client
  await queryClient.prefetchQuery({
    queryKey: ["conversations"],
    queryFn: async () =>
      await DAL.conversation.queries.getUserConversations(userId),
  });

  // Return the client-side wrapper with the dehydrated state
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* We shouldn't need to pass conversationsServer here as it's already prefetched, but because we still get a hydration error, we pass it */}
      <ConversationSidebar conversationsServer={conversations} />
    </HydrationBoundary>
  );
}
