import SkeletonChat from "@/components/skeletons/SkeletonChat";
import { DAL } from "@/db/dal";
import { cachedValidateServerSession } from "@/lib/auth/validateSession";
import { tryCatch } from "@/lib/tryCatch";
import { getQueryClient } from "@/providers/QueryProvider";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import ChatContainer from "./ChatContainer";

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
    queryKey: ["conversation", conversationId],
    queryFn: conversationId
      ? DAL.conversation.queries.getConversationMessages(
          conversationId,
          session.session.user.id,
        )
      : () => [],
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
