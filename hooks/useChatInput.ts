"use client";

import { saveMessagesAction } from "@/actions/conversation-actions";
import { useConversations } from "@/hooks/useConversations";
import { formatConversationTitle } from "@/lib/utils";
import { getQueryClient } from "@/providers/QueryProvider";
import { streamAssistantMessageAndSaveToDb } from "@/services/chatService";
import {
  useChatActions,
  useConversationId,
  useIsLoading,
  useMessages,
} from "@/store/chatStore";
import { ChatMessage } from "@/types/types";
import { useEffect, useRef, useState } from "react";

/**
 * Custom hook to handle chat input logic
 */
export const useChatInput = () => {
  // State selectors
  const messages = useMessages();
  const isLoading = useIsLoading();
  const conversationId = useConversationId();
  const {
    addUserMessage,
    setLoading,
    setConversationId,
    setConversationTitle,
  } = useChatActions();

  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { createConversation } = useConversations();
  const queryClient = getQueryClient();

  // Focus input on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keep focus on input after loading state changes
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    if (!input.trim() || isLoading) return;

    // Store user message for processing
    const userMessage: ChatMessage = { role: "user", content: input.trim() };

    // Clear input field immediately for better UX
    setInput("");

    // Add user message to UI
    addUserMessage(userMessage.content);

    // Set loading state
    setLoading(true);

    try {
      // Determine if this is a new conversation
      const isNewConversation = !conversationId;

      if (isNewConversation) {
        // Handle new conversation creation
        await handleNewConversation(userMessage);
      } else {
        // Handle message in existing conversation
        await handleExistingConversation(userMessage);
      }
    } catch (error) {
      console.error("Error in chat submission:", error);
    } finally {
      // Always reset loading state when done
      setLoading(false);
    }
  };

  /**
   * Handle creation of a new conversation
   */
  const handleNewConversation = async (userMessage: ChatMessage) => {
    // Format title from first message
    const formattedTitle = formatConversationTitle(userMessage.content);

    // Update title in UI
    setConversationTitle(formattedTitle);

    try {
      // Create conversation in database
      const result = await createConversation({
        title: formattedTitle,
        messages: [userMessage],
      });

      // Only update the URL visually without causing any navigation or data fetching
      // Doesn't udpate the conversations sidebar though
      if (window.history) {
        window.history.replaceState(
          {
            ...window.history.state,
            as: `/dashboard/chat/${result.id}`,
            url: `/dashboard/chat/${result.id}`,
          },
          "",
          `/dashboard/chat/${result.id}`,
        );
      }

      // Store the new conversation ID
      setConversationId(result.id);
      // Stream the assistant response
      await streamAssistantMessageAndSaveToDb({
        currentMessages: [userMessage],
        userMessage: userMessage,
        conversationId: result.id,
      });

      //need to rerender my sidebar to refresh the conversation list
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error; // Re-throw to be caught by the main handler
    }
  };

  /**
   * Handle adding message to existing conversation
   */
  const handleExistingConversation = async (userMessage: ChatMessage) => {
    if (!conversationId) {
      console.error("No conversation ID found");
      return;
    }

    try {
      // Save user message to database
      await saveMessagesAction(conversationId, [userMessage]);

      // Update sidebar conversations list
      queryClient.invalidateQueries({ queryKey: ["conversations"] });

      // Prepare current messages including the new user message
      const currentMessagesWithNewMessage = [...messages, userMessage];

      // Stream the assistant response
      await streamAssistantMessageAndSaveToDb({
        currentMessages: currentMessagesWithNewMessage,
        userMessage: userMessage,
        conversationId: conversationId,
      });
    } catch (error) {
      console.error("Error in existing conversation:", error);
      throw error; // Re-throw to be caught by the main handler
    }
  };

  return {
    input,
    setInput,
    inputRef,
    isLoading,
    handleSubmit,
  };
};
