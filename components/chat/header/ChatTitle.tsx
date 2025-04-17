"use client";
import { useConversation } from "@/hooks/tanstack-query/useConversations";
import { useGetConversationId } from "@/hooks/useGetConversationId";

export default function ChatTitleLayout() {
  const conversationId = useGetConversationId();
  const { conversation } = useConversation(conversationId);

  return (
    <div className="min-h-[32px] py-1">
      <h1 className="h-8 text-xl font-bold">
        {conversation?.title ?? "New Conversation"}
      </h1>
    </div>
  );
}
