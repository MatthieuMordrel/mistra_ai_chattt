"use client";

import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { ChatMessage } from "@/types/types";
import { useConversationMutations } from "./useConversationQueries";
import { streamMistralClient } from "@/lib/mistral-client";

/**
 * Custom hook for chat message handling
 * Handles sending messages, generating titles, and saving to the database
 */
export function useChat(conversationId: string | undefined) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Chat store state and actions
  const {
    messages,
    isLoading,
    conversationTitle,
    addUserMessage,
    addAssistantMessage,
    updateAssistantMessage,
    setLoading,
    setStreaming,
    setConversationTitle,
  } = useChatStore();

  // TanStack Query mutations
  const { createConversation, saveMessages, updateTitle } =
    useConversationMutations();

  /**
   * Generates a title from the first user message
   * @param message The first user message
   * @returns The generated title or null if no valid title could be generated
   */
  const generateTitle = (message: string): string | null => {
    // Extract title from first message
    const words = message.split(" ").filter((word) => word.trim());
    let title = words.slice(0, 5).join(" ");

    // Truncate if too long and add ellipsis
    if (title.length > 30) {
      title = title.substring(0, 30).trim() + "...";
    } else if (words.length > 5) {
      title += "...";
    }

    if (title && title.trim() !== "") {
      return title;
    }

    return null;
  };

  /**
   * Saves the conversation to the database
   * @param userMessage The user message
   * @param assistantMessage The assistant message
   * @param newTitle Optional new title
   */
  const saveConversationToDb = async (
    userMessage: ChatMessage,
    assistantMessage: ChatMessage,
    newTitle?: string,
  ) => {
    if (!isAuthenticated) return;

    try {
      if (conversationId) {
        // Save messages to existing conversation
        await saveMessages({
          id: conversationId,
          messages: [...messages, userMessage, assistantMessage],
        });

        // Update title if provided
        if (newTitle) {
          await updateTitle({
            id: conversationId,
            title: newTitle,
          });
        }
      } else {
        // Create new conversation
        const title = newTitle || conversationTitle;

        // Create the conversation
        createConversation({
          title,
          messages: [...messages, userMessage, assistantMessage],
        });
      }
    } catch (error) {
      console.error("Error saving conversation:", error);
    }
  };

  /**
   * Sends a message to the chat API
   * @param message The message to send
   */
  const sendChatMessage = async (message: string) => {
    // Don't process empty messages or when already loading
    if (!message.trim() || isLoading) return;

    // Add user message to chat
    addUserMessage(message);

    // Check if this is the first message
    const shouldGenerateTitle =
      messages.length === 0 && conversationTitle === "New Conversation";

    // Add placeholder for assistant message
    addAssistantMessage("", true);
    setLoading(true);
    setStreaming(true);

    const userMessage: ChatMessage = { role: "user", content: message };

    try {
      // Send message to API
      await streamMistralClient({
        messages: [...messages, userMessage],
        onTokenUpdate: (fullMessage: string, token: string) => {
          // Update the assistant message with each token
          updateAssistantMessage(fullMessage);
        },
        onComplete: async (response: string) => {
          // Mark streaming as complete
          setLoading(false);
          setStreaming(false);

          // Generate title if needed
          let newTitle = null;
          if (shouldGenerateTitle) {
            newTitle = generateTitle(message);
            if (newTitle) {
              setConversationTitle(newTitle);
            }
          }

          // Save to database if authenticated
          await saveConversationToDb(
            userMessage,
            { role: "assistant", content: response },
            newTitle || undefined,
          );
        },
        onError: (error: Error) => {
          // Handle API errors
          updateAssistantMessage(error.message);
          setLoading(false);
          setStreaming(false);
        },
      });
    } catch (error) {
      console.error("Error in sendChatMessage:", error);
      // Handle unexpected errors
      updateAssistantMessage(
        "Sorry, there was an error generating a response. Please try again.",
      );
      setLoading(false);
      setStreaming(false);
    }
  };

  /**
   * Updates the conversation title
   * @param newTitle The new title
   */
  const updateConversationTitle = async (newTitle: string) => {
    setConversationTitle(newTitle);

    // Save title to database if authenticated and we have a conversation ID
    if (isAuthenticated && conversationId) {
      try {
        await updateTitle({
          id: conversationId,
          title: newTitle,
        });
      } catch (error) {
        console.error("Error updating title:", error);
      }
    }
  };

  return {
    messages,
    isLoading,
    conversationTitle,
    sendChatMessage,
    updateConversationTitle,
  };
}
