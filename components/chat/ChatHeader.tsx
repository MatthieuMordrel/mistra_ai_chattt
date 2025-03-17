"use client";
import { useConversationTitle } from "@/store/chatStore";

/**
 * Header component for the chat interface
 * Displays the conversation title
 * The ModelSelector has been moved to the DashboardHeader component
 * to be shared across all dashboard routes
 */
const ChatHeader = () => {
  // Get the conversation title directly from the store
  const conversationTitle = useConversationTitle();

  return (
    <div className="mb-4 flex items-center justify-between border-b pb-2">
      <h1 className="text-xl font-bold">{conversationTitle}</h1>
    </div>
  );
};

export default ChatHeader;
