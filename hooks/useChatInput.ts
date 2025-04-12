"use client";

import { saveMessagesAction } from "@/actions/conversation-actions";
import { useConversations } from "@/hooks/tanstack-query/useConversations";
import { streamAssistantMessageAndSaveToDb } from "@/lib/chatService";
import { tryCatch, tryCatchSync } from "@/lib/tryCatch";
import { formatConversationTitle } from "@/lib/utils";
import { messageSchema } from "@/lib/validation/schemas";
import { getQueryClient } from "@/providers/QueryProvider";
import {
  useChatActions,
  useConversationId,
  useIsCalculatingTokens,
  useIsLoading,
  useMessages,
  useTokenCount,
} from "@/store/chatStore";
import { ChatMessage } from "@/types/types";
import { useState } from "react";
import { z } from "zod";

/**
 * Custom hook to handle chat input logic
 */
export const useChatInput = () => {
  // State selectors
  const messages = useMessages();
  const isLoading = useIsLoading();
  const conversationId = useConversationId();
  const tokenCount = useTokenCount();
  const isCalculatingTokens = useIsCalculatingTokens();
  const {
    addUserMessage,
    setLoading,
    setConversationId,
    setConversationTitle,
    setTokenCount,
  } = useChatActions();

  const [input, setInput] = useState("");
  const { createConversation } = useConversations();
  const queryClient = getQueryClient();

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    if (!input.trim() || isLoading) return;

    // Validate message length
    const { error: validationError } = tryCatchSync(() =>
      messageSchema.parse({ role: "user", content: input.trim() }),
    );

    if (validationError) {
      if (validationError instanceof z.ZodError) {
        const firstError = validationError.errors[0];
        if (firstError) {
          throw new Error(firstError.message);
        }
      }
      throw validationError;
    }

    // Store user message for processing
    const userMessage: ChatMessage = { role: "user", content: input.trim() };

    // Clear input field immediately for better UX
    setInput("");

    // Add user message to UI
    addUserMessage(userMessage.content);

    // Reset token count for new conversation
    if (!conversationId) {
      setTokenCount(0);
    }

    // Set loading state
    setLoading(true);

    // Determine if this is a new conversation
    const isNewConversation = !conversationId;

    if (isNewConversation) {
      // Handle new conversation creation
      const { error: newConversationError } = await tryCatch(
        handleNewConversation(userMessage),
      );
      if (newConversationError) {
        console.error("Error in chat submission:", newConversationError);
      }
    } else {
      // Handle message in existing conversation
      const { error: existingConversationError } = await tryCatch(
        handleExistingConversation(userMessage),
      );
      if (existingConversationError) {
        console.error("Error in chat submission:", existingConversationError);
      }
    }
    setLoading(false);
  };

  /**
   * Handle creation of a new conversation
   */
  const handleNewConversation = async (userMessage: ChatMessage) => {
    // Format title from first message
    const formattedTitle = formatConversationTitle(userMessage.content);

    // Update title in UI
    setConversationTitle(formattedTitle);

    // Create conversation in database
    const { data: result, error } = await tryCatch(
      createConversation({
        title: formattedTitle,
        messages: [userMessage],
      }),
    );
    if (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
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
    const { error: streamAssistantMessageError } = await tryCatch(
      streamAssistantMessageAndSaveToDb({
        currentMessages: [userMessage],
        userMessage: userMessage,
        conversationId: result.id,
      }),
    );
    if (streamAssistantMessageError) {
      console.error(
        "Error streaming assistant message:",
        streamAssistantMessageError,
      );
      throw streamAssistantMessageError;
    }
    //need to rerender my sidebar to refresh the conversation list
  };

  /**
   * Handle adding message to existing conversation
   */
  const handleExistingConversation = async (userMessage: ChatMessage) => {
    if (!conversationId) {
      console.error("No conversation ID found");
      return;
    }

    // Save user message to database
    const { error: saveMessagesError } = await tryCatch(
      saveMessagesAction(conversationId, [userMessage]),
    );
    if (saveMessagesError) {
      console.error("Error saving messages:", saveMessagesError);
      throw saveMessagesError;
    }

    // Update sidebar conversations list to reorder by updatedAt
    queryClient.invalidateQueries({ queryKey: ["conversations"] });

    // Prepare current messages including the new user message
    const currentMessagesWithNewMessage = [...messages, userMessage];

    // Stream the assistant response
    const { error: streamAssistantMessageError } = await tryCatch(
      streamAssistantMessageAndSaveToDb({
        currentMessages: currentMessagesWithNewMessage,
        userMessage: userMessage,
        conversationId: conversationId,
      }),
    );
    if (streamAssistantMessageError) {
      console.error(
        "Error streaming assistant message:",
        streamAssistantMessageError,
      );
      throw streamAssistantMessageError;
    }
  };

  return {
    input,
    setInput,
    isLoading,
    tokenCount,
    isCalculatingTokens,
    handleSubmit,
  };
};
