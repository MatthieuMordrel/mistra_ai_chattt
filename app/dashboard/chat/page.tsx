"use client";

import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import ChatMessageList from "@/components/chat/ChatMessageList";
import { useChatStore } from "@/store/chatStore";
import { useEffect, useRef } from "react";

/**
 * Chat page component that orchestrates the chat interface
 * Uses Zustand store for state management
 */
export default function ChatPage() {
  // Get state and actions from the Zustand store
  const messages = useChatStore((state) => state.messages);
  const isLoading = useChatStore((state) => state.isLoading);
  const conversationTitle = useChatStore((state) => state.conversationTitle);
  const sendChatMessage = useChatStore((state) => state.sendChatMessage);

  // Create a ref for scrolling to the bottom of the chat
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-4xl flex-col p-4">
      <ChatHeader conversationTitle={conversationTitle} />

      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h2 className="mb-2 text-2xl font-bold">
            Welcome to Mistral AI Chat
          </h2>
          <p className="mb-8 text-gray-500">
            Start a conversation by typing a message below.
          </p>
        </div>
      ) : (
        <ChatMessageList messages={messages} messagesEndRef={messagesEndRef} />
      )}

      <ChatInput onSendMessage={sendChatMessage} isLoading={isLoading} />
    </div>
  );
}
