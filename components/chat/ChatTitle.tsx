"use client";
import { useConversationTitle } from "@/store/chatStore";
import { Skeleton } from "../ui/skeleton";

export default function ChatTitle({
  conversationTitleServer,
}: {
  conversationTitleServer?: string;
}) {
  const conversationTitle = useConversationTitle();

  const displayTitle =
    conversationTitleServer || conversationTitle || "New Chat";

  return conversationTitleServer ? (
    <div className="min-h-[32px] py-1">
      <h1 className="text-xl font-bold">{conversationTitleServer}</h1>
    </div>
  ) : conversationTitle ? (
    <div className="min-h-[32px] py-1">
      <h1 className="text-xl font-bold">{conversationTitle}</h1>
    </div>
  ) : (
    <div className="min-h-[32px] py-1">
      <Skeleton className="h-8 w-64" />
    </div>
  );
}
