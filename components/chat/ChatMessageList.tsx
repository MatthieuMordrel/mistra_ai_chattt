"use client";

import { cn } from "@/lib/utils";
import { useMessages } from "@/store/chatStore";
import type { ChatMessage } from "@/types/types";
import ChatMessageItem from "./ChatMessageItem";

const ChatMessageList = ({
  messagesServer = [],
}: {
  messagesServer?: ChatMessage[];
}) => {
  const messagesFromStore = useMessages();

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        className="border-border bg-card dark:bg-card scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent absolute inset-0 overflow-y-auto rounded-lg border p-5 shadow-sm"
        data-slot="messages-container"
      >
        {messagesFromStore.length === 0 && messagesServer.length === 0 ? (
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
              (messagesFromStore.length > 0 || messagesServer.length > 0) &&
                "pt-2",
            )}
          >
            {messagesFromStore.length > 0 ? (
              messagesFromStore.map((message, index) => (
                <ChatMessageItem key={index} message={message} />
              ))
            ) : messagesServer.length > 0 ? (
              messagesServer.map((message, index) => (
                <ChatMessageItem key={index} message={message} />
              ))
            ) : (
              <p className="text-muted-foreground text-center">
                No messages yet
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessageList;
