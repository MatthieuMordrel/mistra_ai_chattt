"use client";

import { saveMessagesAction } from "@/actions/conversation-actions";
import { useConversations } from "@/hooks/useConversations";
import { formatConversationTitle } from "@/lib/utils";
import { streamAssistantMessageAndSaveToDb } from "@/services/chatService";
import {
  useChatActions,
  useConversationId,
  useIsLoading,
  useMessages,
} from "@/store/chatStore";
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

    // Refocus the input after sending
    inputRef.current?.focus();
    if (!input.trim() || isLoading) return;

    // Clear input field immediately for better UX
    setInput("");

    // Add user message to the chat store
    addUserMessage(input);

    // Set loading state
    setLoading(true);

    // Handle first message - create conversation in DB
    if (messages.length === 0) {
      try {
        // Format the title using our utility function
        const formattedTitle = formatConversationTitle(input);

        // Update the title using zustand
        setConversationTitle(formattedTitle);

        // Create the conversation in the DB using TanStack Query mutation
        const result = await createConversation({
          title: formattedTitle,
          messages: [{ role: "user", content: input }],
        });
        // Update the conversation ID in the store
        setConversationId(result.id);

        // Stream the assistant message and save to DB
        await streamAssistantMessageAndSaveToDb({
          currentMessages: [{ role: "user", content: input }],
          userMessage: { role: "user", content: input },
          conversationId: result.id,
        });
      } catch (error) {
        console.error("Error creating conversation:", error);
      }
    } else {
      if (!conversationId) {
        console.error("No conversation ID found");
        setLoading(false);
        return;
      }

      try {
        console.log("Saving user message: conversationId", conversationId);
        // Save the user message to the DB using the action
        await saveMessagesAction(conversationId, [
          { role: "user", content: input },
        ]);
        console.log("User message saved");
      } catch (error) {
        console.error("Error saving user message:", error);
        // Continue even if saving fails - the UI will still show the message
      }

      console.log("Streaming assistant message");
      // Send message to the API using the chat service
      await streamAssistantMessageAndSaveToDb({
        currentMessages: [...messages, { role: "user", content: input }],
        userMessage: { role: "user", content: input },
        conversationId: conversationId,
      });
    }

    // Set loading state back to false when complete
    setLoading(false);
  };

  return {
    input,
    setInput,
    inputRef,
    isLoading,
    handleSubmit,
  };
};
