import { DAL } from "@/db/dal";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ConversationSidebar } from "./ConversationSidebar";

export async function ConversationsSidebar({ userId }: { userId: string }) {
  // If no session, return empty sidebar
  if (!userId) {
    return null;
  }
  const queryClient = new QueryClient();

  //Awaiting here should suspend the component until the data is fetched
  await queryClient.prefetchQuery({
    queryKey: ["conversations"],
    queryFn: () => DAL.conversation.queries.getUserConversations(userId),
  });

  // Return the client-side wrapper with the dehydrated state
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* We shouldn't need to pass conversationsServer here as it's already prefetched, but because we still get a hydration error, we pass it */}
      <ConversationSidebar />
    </HydrationBoundary>
  );
}
