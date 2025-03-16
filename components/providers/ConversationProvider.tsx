"use client";

import { useChatStore } from "@/store/chatStore";
import { ConversationWithMessages } from "@/types/db";
import { ChatMessage } from "@/types/types";
import { useEffect } from "react";

/**
 * Client component that hydrates the chat store with server-fetched conversation data
 * This follows the same pattern as ModelsProvider
 * Used at the chat container level to provide conversation-specific data
 */
export function ConversationProvider({
  conversation,
}: {
  conversation?: ConversationWithMessages;
}) {
  const setConversationId = useChatStore((state) => state.setConversationId);
  const setConversationTitle = useChatStore(
    (state) => state.setConversationTitle,
  );
  const setMessages = useChatStore((state) => state.setMessages);

  useEffect(() => {
    if (conversation?.id) {
      setConversationId(conversation.id);
    }

    if (conversation?.title) {
      setConversationTitle(conversation.title);
    }

    const messages = conversation?.messages;
    if (messages && messages.length > 0) {
      setMessages(
        messages.map((message) => ({
          role: message.role as "user" | "assistant" | "system",
          content: message.content,
          isStreaming: message.isStreaming,
        })) as ChatMessage[],
      );
    }
  }, [conversation, setConversationId, setConversationTitle, setMessages]);

  return null;
}
