import { DAL } from "@/db/dal";
import { getQueryClient } from "@/providers/QueryProvider";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { ConversationSidebar } from "./ConversationSidebar";

export async function ConversationsSidebar({ userId }: { userId: string }) {
  const queryClient = getQueryClient();

  // Get the conversations from the server
  const conversationsServer =
    await DAL.conversation.queries.getUserConversations(userId);

  // Prefetch the conversations
  await queryClient.prefetchQuery({
    queryKey: ["conversations"],
    queryFn: () => DAL.conversation.queries.getUserConversations(userId),
  });

  // Dehydrate the conversations
  const dehydratedState = dehydrate(queryClient);

  // Return the client-side wrapper with the dehydrated state
  return (
    <HydrationBoundary state={dehydratedState}>
      <ConversationSidebar conversationsServer={conversationsServer} />
    </HydrationBoundary>
  );
}
