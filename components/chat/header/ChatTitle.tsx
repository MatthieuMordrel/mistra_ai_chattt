"use client";
import { useConversation } from "@/hooks/tanstack-query/useConversations";
import { useParams } from "next/navigation";

export default function ChatTitleLayout() {
  const params = useParams();
  // Handle correctly typed paramValue (string | string[] | undefined)
  const conversationId = params?.id
    ? Array.isArray(params.id)
      ? params.id[0]
      : params.id
    : undefined;

  // The hook now safely handles undefined IDs
  const { conversation } = useConversation(conversationId);

  return (
    <div className="min-h-[32px] py-1">
      <h1 className="h-8 text-xl font-bold">
        {conversation?.title ?? "New Conversation"}
      </h1>
    </div>
  );
}
