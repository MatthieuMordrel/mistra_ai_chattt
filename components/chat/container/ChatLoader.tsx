import SkeletonChat from "@/components/skeletons/SkeletonChat";
import { cachedValidateServerSession } from "@/lib/auth/validateSession";
import { tryCatch } from "@/lib/tryCatch";
import { getQueryClient } from "@/providers/QueryProvider";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import ChatContainer from "./ChatContainer";
import { queryOptionsConversation } from "@/lib/tanstack/queryOptions";

export async function MessagesLoader({
  conversationId,
}: {
  conversationId?: string;
}) {
  const { data: session, error: sessionError } = await tryCatch(
    cachedValidateServerSession(),
  );

  if (sessionError) {
    console.error("Error fetching session:", sessionError);
  }

  if (!session) {
    return null;
  }

  const queryClient = getQueryClient();

  // Prefetch the conversations
  queryClient.prefetchQuery({
    ...queryOptionsConversation({ conversationId }),
  });

  // console.log(JSON.stringify(dehydrate(queryClient)));
  // Return the client-side wrapper with the dehydrated state
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<SkeletonChat />}>
        <ChatContainer />
      </Suspense>
    </HydrationBoundary>
  );
}
