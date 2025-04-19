import { saveMessagesAction } from "@/actions/conversation-actions";
import { streamMistralClient } from "@/lib/mistral streaming/mistral-client";
import {
  countMessageTokens,
  estimateTokenCount,
} from "@/lib/mistral streaming/tokenizer";
import { useModelStoreBase } from "@/store/modelStore";
import { ChatMessage } from "@/types/types";
import { create } from "zustand";

/**
 * Interface for the chat UI state
 */
interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  tokenCount: number;
  isCalculatingTokens: boolean;
  actions: {
    setMessages: (messages: ChatMessage[]) => void;
    addUserMessage: (message: string) => void;
    addAssistantMessage: (message: string, isStreaming?: boolean) => void;
    updateAssistantMessage: (message: string) => void;
    setLoading: (isLoading: boolean) => void;
    setStreaming: (isStreaming: boolean) => void;
    setTokenCount: (count: number) => void;
    incrementTokenCount: (increment: number) => void;
    setCalculatingTokens: (isCalculating: boolean) => void;
    /**
     * Resets the store for a new conversation
     * Sets title to "New Conversation", clears ID and messages
     */
    resetForNewConversation: () => void;
    /**
     * Streams an assistant message directly from the store
     */
    streamAssistantMessage: (options: {
      currentMessages: ChatMessage[];
      conversationId: string;
      callbacks?: {
        onComplete?: (fullContent: string) => void;
        onError?: (errorMessage: string) => void;
      };
    }) => Promise<void>;
  };
}

/**
 * Create a new message object
 * @param role - The role of the message sender
 * @param content - The content of the message
 * @param isStreaming - Whether the message is streaming
 * @returns A new message object
 */
const createMessage = (
  role: "user" | "assistant" | "system",
  content: string,
  isStreaming: boolean = false,
): ChatMessage => ({
  role,
  content,
  isStreaming,
});

/**
 * Zustand store for managing chat UI state
 */
export const useChatStoreBase = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  isStreaming: false,
  tokenCount: 0,
  isCalculatingTokens: true, //Set to true by default because on the server we don't know the token count
  actions: {
    setMessages: (messages: ChatMessage[]) => {
      set({ messages });
    },

    addUserMessage: (message: string) => {
      set((state) => ({
        messages: [...state.messages, createMessage("user", message, false)],
      }));
    },

    addAssistantMessage: (message: string, isStreaming = false) => {
      set((state) => ({
        messages: [
          ...state.messages,
          createMessage("assistant", message, isStreaming),
        ],
        isStreaming,
      }));
    },

    updateAssistantMessage: (message: string) => {
      set((state) => {
        const messages = [...state.messages];
        const lastIndex = messages.length - 1;

        // Only update if the last message is from the assistant
        if (lastIndex >= 0 && messages[lastIndex]?.role === "assistant") {
          messages[lastIndex] = {
            ...messages[lastIndex],
            content: message,
            isStreaming: state.isStreaming,
          };
        }

        return { messages };
      });
    },

    setLoading: (isLoading: boolean) => {
      set({ isLoading });
    },

    setStreaming: (isStreaming: boolean) => {
      set({ isStreaming });

      // If streaming is done, update the last message
      if (!isStreaming) {
        set((state) => {
          const messages = [...state.messages];
          const lastIndex = messages.length - 1;

          if (lastIndex >= 0 && messages[lastIndex]?.role === "assistant") {
            messages[lastIndex] = {
              ...messages[lastIndex],
              isStreaming: false,
            };
          }

          return { messages };
        });
      }
    },

    setTokenCount: (count: number) => {
      set({ tokenCount: count });
    },

    incrementTokenCount: (increment: number) => {
      set((state) => ({
        tokenCount: state.tokenCount + increment,
      }));
    },

    setCalculatingTokens: (isCalculating: boolean) => {
      set({ isCalculatingTokens: isCalculating });
    },

    resetForNewConversation: () => {
      set({
        messages: [],
        tokenCount: 0,
        isCalculatingTokens: false,
      });
    },

    streamAssistantMessage: async ({
      currentMessages,
      conversationId,
      callbacks,
    }) => {
      const actions = get().actions;

      // Prepare UI state
      actions.addAssistantMessage("", true);
      actions.setLoading(true);
      actions.setStreaming(true);

      // Calculate token count
      try {
        actions.setCalculatingTokens(true);
        const count = await countMessageTokens(currentMessages);
        actions.setTokenCount(count);
      } catch (error) {
        console.error("Error calculating token count:", error);
      } finally {
        actions.setCalculatingTokens(false);
      }

      // Initialize content accumulator
      let accumulatedContent = "";

      try {
        // Get the selected model ID from the store
        const selectedModelId = useModelStoreBase.getState().selectedModelId;

        // Stream the response
        await streamMistralClient({
          model: selectedModelId || "mistral-small-latest",
          messages: currentMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
          callbacks: {
            onToken: (token) => {
              // Accumulate content and update UI
              accumulatedContent += token;
              actions.updateAssistantMessage(accumulatedContent);

              // Estimate and increment token count
              const tokenEstimate = estimateTokenCount(token);
              if (tokenEstimate > 0) {
                actions.incrementTokenCount(tokenEstimate);
              }
            },
            onComplete: async (fullContent) => {
              // Update UI state
              actions.updateAssistantMessage(fullContent);
              actions.setLoading(false);
              actions.setStreaming(false);

              // Call completion callback if provided
              callbacks?.onComplete?.(fullContent);

              // Save the assistant message to the database
              try {
                await saveMessagesAction(conversationId, [
                  {
                    role: "assistant",
                    content: fullContent,
                  },
                ]);
              } catch (error) {
                console.error(
                  "Error saving assistant message to database:",
                  error,
                );
                // Continue even if saving fails - the UI will still show the message
              }
            },
            onError: (error) => {
              console.error("Error streaming response:", error);
              const errorMessage =
                "Sorry, there was an error generating a response. Please try again.";

              // Update UI with error
              actions.updateAssistantMessage(errorMessage);
              actions.setLoading(false);
              actions.setStreaming(false);

              // Call error callback if provided
              callbacks?.onError?.(errorMessage);
            },
          },
        });
      } catch (error) {
        console.error("Error streaming response:", error);
        const errorMessage =
          "Sorry, there was an error generating a response. Please try again.";

        // Update UI with error
        actions.updateAssistantMessage(errorMessage);
        actions.setLoading(false);
        actions.setStreaming(false);

        // Call error callback if provided
        callbacks?.onError?.(errorMessage);
      }
    },
  },
}));

// Export atomic selectors as custom hooks
export const useMessages = () => useChatStoreBase((state) => state.messages);
export const useIsLoading = () => useChatStoreBase((state) => state.isLoading);
export const useIsStreaming = () =>
  useChatStoreBase((state) => state.isStreaming);
export const useTokenCount = () =>
  useChatStoreBase((state) => state.tokenCount);
export const useIsCalculatingTokens = () =>
  useChatStoreBase((state) => state.isCalculatingTokens);

// Export actions as a single hook
export const useChatActions = () => useChatStoreBase((state) => state.actions);
