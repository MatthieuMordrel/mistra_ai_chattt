"use client";

import { useChatStore } from "@/store/chatStore";
import { ChatMessage } from "@/types/types";
import { useEffect } from "react";

/**
 * Client component that hydrates the chat store with server-fetched conversation data
 * This follows the same pattern as ModelsProvider
 * Used at the chat container level to provide conversation-specific data
 */
export function ConversationProvider({
  conversationId,
  conversationTitle,
  messages,
}: {
  conversationId?: string | null;
  conversationTitle?: string;
  messages?: ChatMessage[];
}) {
  const setConversationId = useChatStore((state) => state.setConversationId);
  const setConversationTitle = useChatStore(
    (state) => state.setConversationTitle,
  );
  const setMessages = useChatStore((state) => state.setMessages);

  // Current values from the store
  const storeConversationId = useChatStore((state) => state.conversationId);
  const storeConversationTitle = useChatStore(
    (state) => state.conversationTitle,
  );
  const storeMessages = useChatStore((state) => state.messages);

  // Hydrate the store with server-fetched conversation data
  useEffect(() => {
    // Only update if we have new data and it's different from what's in the store
    if (conversationId && conversationId !== storeConversationId) {
      setConversationId(conversationId);
    }

    if (conversationTitle && conversationTitle !== storeConversationTitle) {
      setConversationTitle(conversationTitle);
    }

    if (messages && messages.length > 0 && storeMessages.length === 0) {
      setMessages(messages);
    }
  }, [
    conversationId,
    conversationTitle,
    messages,
    setConversationId,
    setConversationTitle,
    setMessages,
    storeConversationId,
    storeConversationTitle,
    storeMessages,
  ]);

  // This component doesn't render anything
  return null;
}
