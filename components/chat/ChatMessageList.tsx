"use client";

import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useChatStore } from "@/store/chatStore";
import { MessageWithIsStreaming } from "@/types/db";
import ChatMessageItem from "./ChatMessageItem";
/**
 * @param messages - The messages to display in the chat message list
 * @returns A list of chat messages
 */
const ChatMessageList = ({
  messages = [],
}: {
  messages?: MessageWithIsStreaming[];
}) => {
  const messagesClient = useChatStore((state) => state.messages);
  // Use the auto-scroll hook with UI messages
  const messagesEndRef = useAutoScroll(messages);

  return (
    <div className="flex-1 overflow-y-auto rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center text-center">
          <div className="max-w-md space-y-2">
            <h2 className="text-2xl font-bold">Welcome to Mistral AI Chat</h2>
            <p className="text-gray-500">
              Start a conversation by typing a message below.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {messagesClient.map((message, index) => (
            <ChatMessageItem key={index} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default ChatMessageList;
