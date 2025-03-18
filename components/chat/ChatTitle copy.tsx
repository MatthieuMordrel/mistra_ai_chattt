"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useConversationTitle } from "@/store/chatStore";

export default function ChatTitleLayout() {
  const conversationTitle = useConversationTitle();

  return conversationTitle === "" ? (
    // Show a skeleton loader while waiting for the title
    <div className="min-h-[32px] py-1">
      <Skeleton className="h-8 w-64" />
    </div>
  ) : (
    <div className="min-h-[32px] py-1">
      <h1 className="text-xl font-bold">{conversationTitle}</h1>
    </div>
  );
}
