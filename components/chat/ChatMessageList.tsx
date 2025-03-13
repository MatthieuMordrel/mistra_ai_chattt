"use client";

import { useChatStore } from "@/store/chatStore";
import { ChatMessage } from "@/types/types";
import { useState } from "react";
import ChatMessageItem from "./ChatMessageItem";

/**
 * Component that displays a list of chat messages
 * Provides scrollable container for messages
 * Includes initialization logic to prevent flash of default state
 *
 * @param messages - The messages to display in the chat message list
 * @returns A list of chat messages
 */
const ChatMessageList = ({ messages }: { messages?: ChatMessage[] }) => {
  // State to track if we've initialized the store
  const [isInitialized, setIsInitialized] = useState(false);
  const setMessages = useChatStore((state) => state.setMessages);
  const messagesFromStore = useChatStore((state) => state.messages);

  // Initialize the store synchronously before first render
  if (!isInitialized && messages) {
    setMessages(messages);
    setIsInitialized(true);
  }

  // Use the messages from props if available, otherwise fall back to store
  const displayMessages = messages ? messages : messagesFromStore;

  return (
    <div className="absolute inset-0 overflow-x-hidden overflow-y-auto rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800">
      {displayMessages.length === 0 ? (
        <div className="flex h-full items-center justify-center text-center">
          <div className="max-w-md space-y-2">
            <h2 className="text-2xl font-bold">Welcome to Mistral AI Chat</h2>
            <p className="text-gray-500">
              Start a conversation by typing a message below.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 pb-2">
          {displayMessages.map((message, index) => (
            <ChatMessageItem key={index} message={message} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatMessageList;
