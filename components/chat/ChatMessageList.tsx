"use client";

import { useChatStore } from "@/store/chatStore";
import { ChatMessage } from "@/types/types";
import ChatMessageItem from "./ChatMessageItem";

/**
 * Component that displays a list of chat messages
 * Uses server messages for initial render (SSR)
 * Then switches to store messages after hydration
 */
const ChatMessageList = ({
  messagesServer = [],
}: {
  messagesServer?: ChatMessage[];
}) => {
  const messagesFromStore = useChatStore((state) => state.messages);

  return (
    <div className="relative flex-1 overflow-hidden">
      <div className="absolute inset-0 overflow-x-hidden overflow-y-auto rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800">
        {messagesFromStore.length === 0 && messagesServer.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div className="max-w-md space-y-2">
              <h2 className="text-2xl font-bold">Welcome to Mistral AI Chat</h2>
              <p className="text-gray-500">
                Start a conversation by typing a message below.
              </p>
            </div>
          </div>
        ) : messagesFromStore.length > 0 ? (
          <div className="space-y-4 pb-2">
            {messagesFromStore.map((message, index) => (
              <ChatMessageItem key={index} message={message} />
            ))}
          </div>
        ) : (
          <div className="space-y-4 pb-2">
            {messagesServer.map((message, index) => (
              <ChatMessageItem key={index} message={message} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessageList;
