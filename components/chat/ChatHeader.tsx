"use client";
import { useChatStore } from "@/store/chatStore";
import { useEffect, useState } from "react";

/**
 * Header component for the chat interface
 * Displays the conversation title and provides a button to clear the conversation
 * Includes initialization logic to prevent flash of default state
 */
const ChatHeader = ({ title }: { title?: string }) => {
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
      <div className="flex gap-2"></div>
    </div>
  );
};

export default ChatHeader;
