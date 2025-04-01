import { DAL } from "@/db/dal";
import { Suspense } from "react";
import { ConversationSidebarSkeleton } from "../skeletons/ConversationSidebarSkeleton";
import { ConversationSidebar } from "./ConversationSidebar";

export async function ConversationsSidebar({ userId }: { userId: string }) {
  const conversationsPromise =
    DAL.conversation.queries.getUserConversations(userId);

  // Return the client-side wrapper with the dehydrated state
  return (
    // The use hook inside the client component should suspend until the promise is resolved
    // There shouldn't be hydration mismatch as the fallback is shown until the promise is resolved
    <Suspense fallback={<ConversationSidebarSkeleton />}>
      <ConversationSidebar conversationsPromise={conversationsPromise} />
    </Suspense>
  );
}
