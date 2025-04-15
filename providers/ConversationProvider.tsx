"use client";

import { countMessageTokens } from "@/lib/mistral streaming/tokenizer";
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
  const {
    setMessages,
    resetForNewConversation,
    setTokenCount,
    setCalculatingTokens,
  } = useChatActions();

  // Use a ref to track if we've hydrated the store
  const hasHydrated = useRef(false);

  // Initialize store with server data
  useEffect(() => {
    if (hasHydrated.current) return;

    if (!conversation?.messages) {
      resetForNewConversation();
    }

    const messages = conversation?.messages;
    if (messages && messages.length > 0) {
      const formattedMessages = messages.map((message) => ({
        role: message.role as "user" | "assistant" | "system",
        content: message.content,
        isStreaming: message.isStreaming,
      })) as ChatMessage[];

      setMessages(formattedMessages);

      // Calculate token count for the existing conversation
      setCalculatingTokens(true);
      countMessageTokens(formattedMessages)
        .then((count) => {
          setTokenCount(count);
        })
        .catch((err) => {
          console.error("Error calculating initial token count:", err);
        })
        .finally(() => {
          setCalculatingTokens(false);
        });
    }

    hasHydrated.current = true;
  }, [
    conversation,
    setMessages,
    resetForNewConversation,
    setTokenCount,
    setCalculatingTokens,
  ]);

  return null;
}
