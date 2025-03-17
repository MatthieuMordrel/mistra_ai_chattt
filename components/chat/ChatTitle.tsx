"use client";
import { useConversationTitle } from "@/store/chatStore";

export default function ChatTitle({
  conversationTitleServer,
}: {
  conversationTitleServer?: string;
}) {
  const conversationTitle = useConversationTitle();

  const displayTitle =
    conversationTitleServer || conversationTitle || "New Chat";

  return (
    <div className="min-h-[32px] py-1">
      <h1 className="text-xl font-bold">{displayTitle}</h1>
    </div>
  );
}
