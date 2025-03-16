"use client";
import { useChatStore } from "@/store/chatStore";
export default function ChatTitle({
  conversationTitleServer,
}: {
  conversationTitleServer?: string;
}) {
  const conversationTitle = useChatStore((state) => state.conversationTitle);

  const displayTitle =
    conversationTitleServer || conversationTitle || "New Chat";

  return (
    <div className="min-h-[32px] py-1">
      <h1 className="text-xl font-bold">{displayTitle}</h1>
    </div>
  );
}
