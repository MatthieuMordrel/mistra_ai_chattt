"use client";

import { useChatActions, useMessages } from "@/store/chatStore";
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
  const messagesStore = useMessages();
  // console.log("rerender");
  // Use the actions hook to get all actions at once
  const {
    setConversationId,
    setConversationTitle,
    setMessages,  
    resetForNewConversation,
  } = useChatActions();

  // Use a ref to track if we've hydrated the store
  const hasHydrated = useRef(false);
  console.log("hasHydrated", hasHydrated.current);

  // Initialize store with server data
  useEffect(() => {
    if (hasHydrated.current || messagesStore.length > 0) return;

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
    // If there is no conversation provided by the server, reset the store
    if (!conversation) {
      resetForNewConversation();
    }

    hasHydrated.current = true;
  }, [conversation, setConversationId, setConversationTitle, setMessages]);

  return null;
}
