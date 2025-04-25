import ChatContainer from "@/components/chat/container/ChatContainer";
import { DAL } from "@/db/dal";
import { cachedValidateServerSession } from "@/lib/auth/validateSession";
import { Metadata } from "next";

/**
 * Generates metadata for the conversation page
 * @param params - The parameters for the conversation page
 * @returns The metadata for the conversation page
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ id: string }>;
}): Promise<Metadata> {
  const [{ id: conversationId }, { session }] = await Promise.all([
    searchParams,
    cachedValidateServerSession(),
  ]);
  if (!conversationId) {
    return {
      title: "",
    };
  }
  const conversationTitle = await DAL.conversation.queries.getConversationTitle(
    conversationId,
    session.session.userId,
  )();
  return {
    title: conversationTitle,
  };
}

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ id: string }>;
}) {
  await cachedValidateServerSession(true);
  const { id: conversationId } = await searchParams;
  console.log("chat page", conversationId);
  return <ChatContainer />;
}
