"use client";

import { useChatStore } from "@/store/chatStore";
import { ChatMessage } from "@/types/types";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

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

  // Get the current pathname to check if we're on the new conversation page
  const pathname = usePathname();

  // Use a ref to track if we've already hydrated this component
  // This prevents re-hydration during navigation
  const hasHydrated = useRef(false);

  // Check if we're on the new conversation page
  const isNewConversationPage =
    pathname === "/dashboard/chat" && !conversationId;

  // Check if the store already has "New Conversation" set
  const hasNewConversationTitle = storeConversationTitle === "New Conversation";

  // Hydrate the store with server-fetched conversation data
  useEffect(() => {
    // Skip hydration completely if:
    // 1. We're on the new conversation page with "New Conversation" title already set, OR
    // 2. We've already hydrated this component instance
    if (
      (isNewConversationPage && hasNewConversationTitle) ||
      hasHydrated.current
    ) {
      return;
    }

    // For new conversation page without the title set, only set it if it's empty
    if (isNewConversationPage) {
      if (!storeConversationTitle) {
        setConversationTitle("New Conversation");
      }
      hasHydrated.current = true;
      return;
    }

    // For existing conversations, update as normal
    if (conversationId && conversationId !== storeConversationId) {
      setConversationId(conversationId);
    }

    if (
      conversationTitle &&
      conversationTitle !== storeConversationTitle &&
      !isNewConversationPage
    ) {
      setConversationTitle(conversationTitle);
    }

    if (messages && messages.length > 0 && storeMessages.length === 0) {
      setMessages(messages);
    }

    // Mark as hydrated
    hasHydrated.current = true;
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
    isNewConversationPage,
    hasNewConversationTitle,
    pathname,
  ]);

  // This component doesn't render anything
  return null;
}
