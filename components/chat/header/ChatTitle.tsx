"use client";
import { useConversation } from "@/hooks/tanstack-query/useConversations";
import { useGetConversationIdFromParams } from "@/hooks/useGetConversationIdFromParams";

export default function ChatTitleLayout() {
  const conversationId = useGetConversationIdFromParams();
  const { conversation } = useConversation(conversationId ?? "");

  return (
    <div className="min-h-[32px] py-1">
      <h1 className="h-8 text-xl font-bold">
        {conversation?.title ?? "New Conversation"}
      </h1>
    </div>
  );
}
