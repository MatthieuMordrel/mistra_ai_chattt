/**
 * Chat service for sending messages to the API
 */
import {
  createConversation,
  saveMessages,
  updateConversationTitle,
} from "@/app/actions/conversation-actions";
import { sendMessage } from "@/services/chatService";
import { ChatMessage } from "@/types/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Interface defining the chat store state
 */
interface ChatState {
  /** Array of chat messages in the current conversation */
  messages: ChatMessage[];
  /** Flag indicating if a message is currently being processed */
  isLoading: boolean;
  /** Unique identifier for the current conversation */
  conversationId: string | null;
  /** Title of the current conversation */
  conversationTitle: string;
  /** Flag indicating if changes need to be saved to the database */
  isDirty: boolean;
  /** Current user ID (needed for database operations) */
  userId: string | null;

  /**
   * Sets the current user ID
   * @param userId - The user ID to set
   */
  setUserId: (userId: string) => void;

  /**
   * Sends a user message to the chat API and handles the response
   * @param message - The message text to send
   * @returns A promise that resolves when the message has been processed
   */
  sendChatMessage: (message: string) => Promise<void>;

  /**
   * Updates the title of the current conversation
   * @param title - The new title to set
   */
  setConversationTitle: (title: string) => void;

  /**
   * Clears all messages and resets the conversation state
   */
  clearConversation: () => void;

  /**
   * Loads an existing conversation into the store
   * @param conversationId - The ID of the conversation to load
   * @param messages - The messages in the conversation
   * @param title - The title of the conversation
   */
  loadConversation: (
    conversationId: string,
    messages: ChatMessage[],
    title: string,
  ) => void;

  /**
   * Automatically generates a title based on the first user message
   */
  generateTitleFromFirstMessage: () => void;

  /**
   * Saves the current conversation to the database
   * Creates a new conversation if one doesn't exist
   */
  saveConversation: () => Promise<void>;
}

/**
 * Zustand store for managing chat state
 * Uses persist middleware to save state to localStorage
 */
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      messages: [],
      isLoading: false,
      conversationId: null,
      conversationTitle: "New Conversation",
      isDirty: false,
      userId: null,

      // Set the current user ID
      setUserId: (userId: string) => {
        set({ userId });
      },

      sendChatMessage: async (message: string) => {
        const { messages, isLoading, userId } = get();

        // Don't process empty messages or when already loading
        if (!message.trim() || isLoading) return;

        // Check if this is the first message before adding the new one
        const shouldGenerateTitle = messages.length === 0;
        console.log(
          "Should generate title:",
          shouldGenerateTitle,
          "Messages length:",
          messages.length,
        );

        // Add user message to chat
        const userMessage: ChatMessage = { role: "user", content: message };
        set((state) => ({
          messages: [...state.messages, userMessage],
          isDirty: true,
        }));

        // Generate title immediately if this is the first message
        if (shouldGenerateTitle) {
          console.log("Generating title immediately after first message");
          // We need to wait for the state to update before generating the title
          setTimeout(() => {
            get().generateTitleFromFirstMessage();
          }, 0);
        }

        // Get the updated messages array that includes the new user message
        const updatedMessages = get().messages;

        // Add placeholder for assistant message
        set((state) => ({
          messages: [
            ...state.messages,
            { role: "assistant", content: "", isStreaming: true },
          ],
          isLoading: true,
        }));

        // The assistant message is the last one in the array
        const assistantMessageIndex = get().messages.length - 1;
        console.log("Assistant message index:", assistantMessageIndex);

        try {
          // Send message to API using our service
          await sendMessage({
            currentMessages: updatedMessages,
            userMessage,
            onTokenUpdate: (_, token) => {
              // Update the assistant message with each token
              set((state) => {
                const updated = [...state.messages];
                if (updated[assistantMessageIndex]) {
                  updated[assistantMessageIndex] = {
                    ...updated[assistantMessageIndex],
                    content: updated[assistantMessageIndex].content + token,
                  };
                }
                return { messages: updated };
              });
            },
            onComplete: (_) => {
              // Mark streaming as complete
              set((state) => {
                const updated = [...state.messages];
                if (updated[assistantMessageIndex]) {
                  updated[assistantMessageIndex] = {
                    ...updated[assistantMessageIndex],
                    isStreaming: false,
                  };
                }
                return { messages: updated, isLoading: false, isDirty: true };
              });

              // Save the conversation to the database if we have a user ID
              if (userId) {
                get().saveConversation();
              }
            },
            onError: (_, errorMessage) => {
              set((state) => {
                const updated = [...state.messages];
                if (updated[assistantMessageIndex]) {
                  updated[assistantMessageIndex] = {
                    role: "assistant",
                    content: errorMessage,
                    isStreaming: false,
                  };
                }
                return { messages: updated, isLoading: false, isDirty: true };
              });
            },
          });
        } catch (error) {
          console.error("Error in sendChatMessage:", error);
          // Handle any unexpected errors
          set((state) => {
            const updated = [...state.messages];
            if (updated[assistantMessageIndex]) {
              updated[assistantMessageIndex] = {
                role: "assistant",
                content:
                  "Sorry, there was an error generating a response. Please try again.",
                isStreaming: false,
              };
            }
            return { messages: updated, isLoading: false, isDirty: true };
          });
        }
      },

      setConversationTitle: (title: string) => {
        const { conversationId, userId } = get();

        set({ conversationTitle: title, isDirty: true });

        // Update the title in the database if we have a conversation ID and user ID
        if (conversationId && userId) {
          updateConversationTitle(conversationId, title).catch((error) => {
            console.error("Error updating conversation title:", error);
          });
        }
      },

      clearConversation: () => {
        set({
          messages: [],
          conversationId: null,
          conversationTitle: "New Conversation",
          isDirty: false,
        });
      },

      loadConversation: (
        conversationId: string,
        messages: ChatMessage[],
        title: string,
      ) => {
        set({
          conversationId,
          messages,
          conversationTitle: title,
          isDirty: false,
        });
      },

      generateTitleFromFirstMessage: () => {
        const { messages, conversationTitle } = get();
        console.log("Generating title from messages:", messages);

        // Only generate a title if we're using the default title
        if (conversationTitle !== "New Conversation") {
          console.log(
            "Not generating title because it's already set:",
            conversationTitle,
          );
          return;
        }

        // Find the first user message
        const firstUserMessage = messages.find((msg) => msg.role === "user");
        console.log("First user message:", firstUserMessage);

        if (firstUserMessage && firstUserMessage.content.trim()) {
          // Extract the first 5 words or 30 characters, whichever is shorter
          const words = firstUserMessage.content
            .split(" ")
            .filter((word) => word.trim());
          let title = words.slice(0, 5).join(" ");

          // Truncate if too long and add ellipsis
          if (title.length > 30) {
            title = title.substring(0, 30).trim() + "...";
          }

          // Add ellipsis if we truncated the message
          else if (words.length > 5) {
            title += "...";
          }

          // Make sure the title is not empty
          if (!title || title.trim() === "") {
            console.log("Generated title is empty, using default");
            return;
          }

          console.log("Generated title:", title);
          set({ conversationTitle: title, isDirty: true });
        } else {
          console.log("No valid user message found for title generation");
        }
      },

      saveConversation: async () => {
        const { conversationId, messages, conversationTitle, userId, isDirty } =
          get();

        // Don't save if there's nothing to save or no user ID
        if (!isDirty || !userId || messages.length === 0) {
          return;
        }

        try {
          // If we don't have a conversation ID, create a new conversation
          let currentConversationId = conversationId;
          if (!currentConversationId) {
            const result = await createConversation(
              conversationTitle,
              messages,
            );
            currentConversationId = result.id;
            set({ conversationId: currentConversationId, isDirty: false });
          } else {
            // Otherwise, save the messages to the existing conversation
            await saveMessages(currentConversationId, messages);

            // Update the title if it's not the default
            if (conversationTitle !== "New Conversation") {
              await updateConversationTitle(
                currentConversationId,
                conversationTitle,
              );
            }

            set({ isDirty: false });
          }
        } catch (error) {
          console.error("Error saving conversation:", error);
        }
      },
    }),
    {
      name: "chat-storage", // name for the localStorage key
      partialize: (state) => ({
        // Only persist these fields to localStorage
        messages: state.messages,
        conversationId: state.conversationId,
        conversationTitle: state.conversationTitle,
        userId: state.userId,
      }),
    },
  ),
);
