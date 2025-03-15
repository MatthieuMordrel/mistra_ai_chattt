import ChatContainer from "@/components/chat/ChatContainer";
import { ConversationService } from "@/db/services/conversation-service";
import { validateServerSession } from "@/lib/auth/validateSession";
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
  const user = await validateServerSession();
  //Fetch the messages using the conversation id on the server
  const conversation = await ConversationService.getConversation(
    conversationId,
    user?.user.id!,
  );
  return (
    <div className="flex h-full flex-col">
      <Suspense fallback={<div>Loading...</div>}>
        <ChatContainer conversation={conversation} />
      </Suspense>
    </div>
  );
}
