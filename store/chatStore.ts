import { sendMessage } from "@/services/chatService";
import { ChatMessage } from "@/types/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Interface defining the chat store state
 */
interface ChatState {
  // State
  messages: ChatMessage[];
  isLoading: boolean;
  conversationId: string | null;
  conversationTitle: string;

  // Actions
  sendChatMessage: (message: string) => Promise<void>;
  setConversationTitle: (title: string) => void;
  clearConversation: () => void;
  loadConversation: (
    conversationId: string,
    messages: ChatMessage[],
    title: string,
  ) => void;
  generateTitleFromFirstMessage: () => void;
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

      // Actions
      sendChatMessage: async (message: string) => {
        const { messages, isLoading } = get();

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
        }));

        // Generate title immediately if this is the first message
        if (shouldGenerateTitle) {
          console.log("Generating title immediately after first message");
          // We need to wait for the state to update before generating the title, because thate state update is async
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
                return { messages: updated, isLoading: false };
              });

              // We no longer need to generate the title here since we do it immediately after the first message
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
                return { messages: updated, isLoading: false };
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
            return { messages: updated, isLoading: false };
          });
        }
      },

      setConversationTitle: (title: string) => {
        set({ conversationTitle: title });
      },

      clearConversation: () => {
        set({
          messages: [],
          conversationId: null,
          conversationTitle: "New Conversation",
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
        });
      },

      /**
       * Generate a title based on the first user message
       * This is a simple implementation that extracts the first few words
       */
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
          set({ conversationTitle: title });
        } else {
          console.log("No valid user message found for title generation");
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
      }),
    },
  ),
);
