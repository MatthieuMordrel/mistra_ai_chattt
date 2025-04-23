"use client";

import { useConversationDetails } from "@/hooks/tanstack-query/useConversationDetails";
import { useGetConversationIdFromParams } from "@/hooks/useGetConversationIdFromParams";
import { useAutoScroll } from "@/hooks/utils/useAutoScroll";
import { cn } from "@/lib/utils";
import ChatMessageItem from "./ChatMessageItem";

const ChatMessageList = () => {
  const conversationId = useGetConversationIdFromParams();
  const { messages: messagesFromStore } =
    useConversationDetails(conversationId);
  const messagesEndRef = useAutoScroll();

  // Ensure messagesFromStore is an array before using map
  const messages = Array.isArray(messagesFromStore) ? messagesFromStore : [];

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        className="bg-card dark:bg-card scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent absolute inset-0 overflow-y-auto rounded-lg p-5 shadow-sm"
        data-slot="messages-container"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div className="max-w-md space-y-4 px-4">
              <h2 className="text-foreground text-2xl font-semibold">
                Welcome to Mistral AI Chat
              </h2>
              <p className="text-muted-foreground">
                Start a conversation by typing a message below.
              </p>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "mx-12 space-y-4 pb-4",
              messages.length > 0 && "pt-2",
            )}
          >
            {messages.map((message, index) => (
              <ChatMessageItem key={index} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessageList;
