import ChatContainer from "@/components/chat/ChatContainer";
import SkeletonChat from "@/components/skeletons/SkeletonChat";
import { ConversationService } from "@/db/services/conversation-service";
import { cachedValidateServerSession } from "@/lib/auth/validateSession";
import { Suspense } from "react";
/**
 * Chat page component for existing conversations
 * Uses the ChatContainer component for the UI
 */
export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: conversationId } = await params;
  //This can probably be removed since we are using middleware to validate the session and we have the user within the headers
  const { session } = await cachedValidateServerSession();
  //Fetch the messages using the conversation id on the server
  const conversation = await ConversationService.getConversation(
    conversationId,
    session?.session.userId as string,
  );
  return (
    <div className="flex h-full flex-col">
      <Suspense fallback={<SkeletonChat />}>
        <ChatContainer conversation={conversation} />
      </Suspense>
    </div>
  );
}
