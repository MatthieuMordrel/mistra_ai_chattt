"use client";
import { useChatStore } from "@/store/chatStore";
import { ModelSelector } from "./ModelSelector";

/**
 * Header component for the chat interface
 * Displays the conversation title and provides a model selector
 * Gets the conversation title directly from the Zustand store
 * which is hydrated at the container level via ServerConversationLoader
 */
const ChatHeader = () => {
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
};

export default ChatHeader;
