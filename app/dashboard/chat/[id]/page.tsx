import ChatContainer from "@/components/chat/ChatContainer";
import { ConversationService } from "@/db/services/conversation-service";
import { validateServerSession } from "@/lib/validateSession";
/**
 * Chat page component for existing conversations
 * Uses the ChatContainer component for the UI
 */
export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await validateServerSession();
  //Fetch the messages using the conversation id on the server
  const conversation = await ConversationService.getConversation(
    id,
    user.user.id,
  );
  console.log("conversation", conversation);
  return (
    <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-4xl flex-col p-4">
      <ChatContainer conversation={conversation} />
    </div>
  );
}
