"use client";
import { useChatStore } from "@/store/chatStore";
import { useEffect } from "react";
/**
 * Header component for the chat interface
 * Displays the conversation title and provides a button to clear the conversation
 */
const ChatHeader = ({ title = "New Conversation" }: { title?: string }) => {
  const setConversationTitle = useChatStore(
    (state) => state.setConversationTitle,
  );
  const titleClient = useChatStore((state) => state.conversationTitle);
  useEffect(() => {
    setConversationTitle(title);
  }, [title]);
  return (
    <div className="mb-4 flex items-center justify-between border-b pb-2">
      <h1 className="text-xl font-bold">{titleClient}</h1>
      <div className="flex gap-2"></div>
    </div>
  );
};

export default ChatHeader;
