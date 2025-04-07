import { DAL } from "@/db/dal";
import { cachedValidateServerSession } from "@/lib/auth/validateSession";
import { tryCatch } from "@/lib/tryCatch";
import { getQueryClient } from "@/providers/QueryProvider";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import { ConversationSidebarSkeleton } from "../skeletons/ConversationSidebarSkeleton";
import { ConversationSidebar } from "./ConversationSidebar";

export async function ConversationsSidebar() {
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
    queryKey: ["conversations"],
    queryFn: DAL.conversation.queries.getUserConversations(
      session.session.user.id,
    ),
  });

  // Return the client-side wrapper with the dehydrated state
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ConversationSidebarSkeleton />}>
        <ConversationSidebar />
      </Suspense>
    </HydrationBoundary>
  );
}
