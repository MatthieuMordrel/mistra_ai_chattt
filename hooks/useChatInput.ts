"use client";

import { useConversationDetails } from "@/hooks/tanstack-query/useConversationDetails";
import { useConversations } from "@/hooks/tanstack-query/useConversations";
import { tryCatch } from "@/lib/tryCatch";
import { formatConversationTitle } from "@/lib/utils";
import { messageSchema } from "@/lib/validation/schemas";
import { ChatMessage } from "@/types/types";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { useGetConversationIdFromParams } from "./useGetConversationIdFromParams";

export const useChatInput = () => {
  const conversationId = useGetConversationIdFromParams();
  const { messages, streamAndSaveMessage, saveMessages, isSavingMessages } =
    useConversationDetails(conversationId);
  const [input, setInput] = useState("");
  const { createConversation } = useConversations();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    if (!input.trim() || isSavingMessages) return;

    // Validate message length
    const { error: validationError } = messageSchema.safeParse({
      role: "user",
      content: input.trim(),
    });

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
  };

  const handleNewConversation = async (userMessage: ChatMessage) => {
    // Format title from first message
    const formattedTitle = formatConversationTitle(userMessage.content);

    // Generate a temporary ID for the user message
    const tempMessageId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Set the query data as an array instead of just the message
    queryClient.setQueryData(
      ["conversation", null],
      [
        {
          id: tempMessageId,
          conversationId: null,
          role: "user",
          content: userMessage.content,
          tokens: null,
          createdAt: new Date().toISOString(),
          isStreaming: false,
        },
      ],
    );

    // Create conversation in database
    const { data: result, error } = await tryCatch(
      createConversation({
        title: formattedTitle,
        messages: [userMessage],
      }),
    );

    if (error) {
      console.error("Error creating conversation:", error);
      // Add more detailed error logging
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      throw error;
    }

    // Stream the assistant response
    const { error: streamError } = await tryCatch(
      streamAndSaveMessage({
        messages: [userMessage],
        conversationId: result.id,
      }),
    );

    if (streamError) {
      console.error("Error streaming assistant message:", streamError);
      // Add more detailed error logging
      if (streamError instanceof Error) {
        console.error("Error message:", streamError.message);
        console.error("Error stack:", streamError.stack);
      }
      throw streamError;
    }
  };

  const handleExistingConversation = async (userMessage: ChatMessage) => {
    if (!conversationId) {
      console.error("No conversation ID found");
      return;
    }

    // Save user message and get response
    await saveMessages([userMessage]);

    // Stream the assistant response
    const { error: streamError } = await tryCatch(
      streamAndSaveMessage({
        messages: [...messages, userMessage],
        conversationId,
      }),
    );

    if (streamError) {
      console.error("Error streaming assistant message:", streamError);
      // Add more detailed error logging
      if (streamError instanceof Error) {
        console.error("Error message:", streamError.message);
        console.error("Error stack:", streamError.stack);
      }
      throw streamError;
    }
  };

  return {
    input,
    setInput,
    isLoading: isSavingMessages,
    handleSubmit,
  };
};
