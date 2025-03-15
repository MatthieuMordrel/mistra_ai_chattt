"use client";

import { useChatStore } from "@/store/chatStore";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ModelSelector } from "./ModelSelector";

/**
 * Header component for the chat page
 * Displays the conversation title and model selector
 * This component is placed in the chat layout to be truly shared across all chat routes
 * The conversation title is reactive and updates based on the current conversation
 */
export function ChatPageHeader() {
  const pathname = usePathname();
  // Get the conversation title directly from the store
  const conversationTitle = useChatStore((state) => state.conversationTitle);
  const conversationId = useChatStore((state) => state.conversationId);

  // Add an effect to log when the component renders with different values
  useEffect(() => {
    console.log(
      `ChatPageHeader rendered with title: "${conversationTitle}", path: ${pathname}, id: ${conversationId}`,
    );
  }, [conversationTitle, pathname, conversationId]);

  return (
    <div className="mb-4 flex items-center justify-between border-b pb-2">
      <h1 className="text-xl font-bold">{conversationTitle}</h1>
      <div className="flex gap-2">
        <ModelSelector />
      </div>
    </div>
  );
}
