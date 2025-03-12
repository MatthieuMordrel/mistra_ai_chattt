import ChatContainer from "@/components/chat/ChatContainer";
import { ConversationService } from "@/db/services/conversation-service";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
/**
 * Chat page component for existing conversations
 * Uses the ChatContainer component for the UI
 */
export default async function ConversationPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const session = await auth.api.getSession({ headers: await headers() });
  //Fetch the messages using the conversation id on the server
  const conversation = await ConversationService.getConversation(
    id,
    session?.user.id ?? "",
  );
  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-4xl flex-col p-4">
      <ChatContainer conversation={conversation} />
    </div>
  );
}
