import { DAL } from "@/db/dal";
import { Suspense } from "react";
import { ConversationSidebarSkeleton } from "../skeletons/ConversationSidebarSkeleton";
import { ConversationSidebar } from "./ConversationSidebar";

export async function ConversationsSidebar({ userId }: { userId: string }) {
  // If no session, return empty sidebar
  if (!userId) {
    return null;
  }
  // const queryClient = getQueryClient();

  // Await the conversations data on the server, to be passed to the client to avoid hydration errors
  const conversationsPromise =
    DAL.conversation.queries.getUserConversations(userId);

  // Prefetch the conversations data on the server, this should be dehydrated and sent to the client
  // await queryClient.prefetchQuery({
  //   queryKey: ["conversations"],
  //   queryFn: async () =>
  //     await DAL.conversation.queries.getUserConversations(userId),
  // });

  // Return the client-side wrapper with the dehydrated state
  return (
    // <HydrationBoundary state={dehydrate(queryClient)}>
    // {/* We shouldn't need to pass conversationsServer here as it's already prefetched, but because we still get a hydration error, we pass it */}
    <Suspense fallback={<ConversationSidebarSkeleton />}>
      <ConversationSidebar conversationsPromise={conversationsPromise} />
    </Suspense>
    // </HydrationBoundary>
  );
}
