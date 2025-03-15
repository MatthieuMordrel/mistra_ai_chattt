"use client";
import { useChatStore } from "@/store/chatStore";
import { useModelStore } from "@/store/modelStore";
import { useEffect, useState } from "react";
import { ModelSelector } from "./ModelSelector";

/**
 * Header component for the chat interface
 * Displays the conversation title and provides a model selector
 * Uses models from the Zustand store which is hydrated at the layout level
 */
const ChatHeader = ({
  titleServer: title,
}: {
  titleServer?: string;
  modelsServer?: any; // Keep for backward compatibility but don't use
}) => {
  // State to track if we've initialized the store
  const [isInitialized, setIsInitialized] = useState(false);
  const setConversationTitle = useChatStore(
    (state) => state.setConversationTitle,
  );

  useEffect(() => {
    if (!isInitialized && title) {
      setConversationTitle(title);
      setIsInitialized(true);
    }
  }, [isInitialized, title, setConversationTitle]);

  return (
    <div className="mb-4 flex items-center justify-between border-b pb-2">
      <h1 className="text-xl font-bold">{title}</h1>
      <div className="flex gap-2">
        <ModelSelector />
      </div>
    </div>
  );
};

export default ChatHeader;
