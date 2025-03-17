"use client";

import { useChatActions } from "@/store/chatStore";
import { ConversationWithMessages } from "@/types/db";
import { ChatMessage } from "@/types/types";
import { useEffect, useRef } from "react";

/**
 * Client component that hydrates the chat store with server-fetched conversation data
 * Uses the actions hook to access store actions
 */
export function ConversationProvider({
  conversation,
}: {
  conversation?: ConversationWithMessages;
}) {
  // Use the actions hook to get all actions at once
  const { setConversationId, setConversationTitle, setMessages } =
    useChatActions();

  // Use a ref to track if we've hydrated the store
  const hasHydrated = useRef(false);

  // Initialize store with server data
  useEffect(() => {
    if (hasHydrated.current) return;

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

    hasHydrated.current = true;
  }, [conversation, setConversationId, setConversationTitle, setMessages]);

  return null;
}
