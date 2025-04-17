import ChatContainer from "@/components/chat/container/ChatContainer";
import { DAL } from "@/db/dal";
import { cachedValidateServerSession } from "@/lib/auth/validateSession";
import { Metadata } from "next";
type Props = {
  params: Promise<{ id: string }>;
};

/**
 * Generates metadata for the conversation page
 * @param params - The parameters for the conversation page
 * @returns The metadata for the conversation page
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [{ id: conversationId }, { session }] = await Promise.all([
    params,
    cachedValidateServerSession(),
  ]);
  const conversation = await DAL.conversation.queries.getConversation(
    conversationId,
    session.session.userId,
  );
  return {
    title: conversation.title,
  };
}
/**
 * Chat page component for existing conversations
 * Uses the ChatContainer component for the UI
 */
export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id: conversationId }, { session }] = await Promise.all([
    params,
    cachedValidateServerSession(true),
  ]);
  //Fetching the conversation from the server
  const conversation = await DAL.conversation.queries.getConversation(
    conversationId,
    session.session.userId,
  );

  return (
    <div className="flex h-full flex-col">
      <ChatContainer conversation={conversation} />
    </div>
  );
}
