"use client";

import { useChatStore } from "@/store/chatStore";
import { ModelSelector } from "./ModelSelector";

/**
 * Header component for the chat page
 * Displays the conversation title and model selector
 * This component is placed in the chat layout to be truly shared across all chat routes
 * The conversation title is reactive and updates based on the current conversation
 */
export function ChatPageHeader() {
  // Get the conversation title directly from the store
  const conversationTitle = useChatStore((state) => state.conversationTitle);

  return (
    <div className="mb-4 flex items-center justify-between border-b pb-2">
      <h1 className="text-xl font-bold">{conversationTitle}</h1>
      <div className="flex gap-2">
        <ModelSelector />
      </div>
    </div>
  );
}
