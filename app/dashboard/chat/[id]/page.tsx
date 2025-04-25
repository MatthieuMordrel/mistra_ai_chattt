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
  const conversationTitle = await DAL.conversation.queries.getConversationTitle(
    conversationId,
    session.session.userId,
  )();
  return {
    title: conversationTitle,
  };
}

export default async function ConversationPage() {
  await cachedValidateServerSession(true);

  return <></>;
}
