"use client";

import { useChatStore } from "@/store/chatStore";
import { useEffect } from "react";
import { useConversation } from "./useConversationQueries";

/**
 * Custom hook for loading conversation data
 * Handles fetching conversation data and updating the chat store
 */
export function useConversationLoader(conversationId: string | undefined) {
  // Chat store actions
  const { setMessages, setConversationTitle, clearConversation } =
    useChatStore();

  // TanStack Query for fetching conversation
  const { conversation, isLoading: isLoadingConversation } = useConversation(
    conversationId || null,
  );

  // Load conversation if ID is provided
  useEffect(() => {
    if (conversationId && conversation) {
      // Set messages and title from the loaded conversation
      setMessages(conversation.messages);
      setConversationTitle(conversation.title);
    } else if (!conversationId) {
      // Clear conversation if no ID is provided
      clearConversation();
    }
  }, [
    conversationId,
    conversation,
    setMessages,
    setConversationTitle,
    clearConversation,
  ]);

  return {
    conversation,
    isLoadingConversation,
  };
}
