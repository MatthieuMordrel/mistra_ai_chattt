import { ChatMessage } from "@/types/types";
import { create } from "zustand";

/**
 * Interface for the chat UI state
 */
interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  conversationId: string | undefined;
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
    setConversationId: (id: string | undefined) => void;
    incrementTokenCount: (increment: number) => void;
    setCalculatingTokens: (isCalculating: boolean) => void;
    /**
     * Resets the store for a new conversation
     * Sets title to "New Conversation", clears ID and messages
     */
    resetForNewConversation: () => void;
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
export const useChatStoreBase = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  conversationId: undefined,
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

    setConversationId: (id: string | undefined) => {
      set({ conversationId: id });
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
        conversationId: undefined,
        messages: [],
        tokenCount: 0,
        isCalculatingTokens: false,
      });
    },
  },
}));

// Export atomic selectors as custom hooks
export const useMessages = () => useChatStoreBase((state) => state.messages);
export const useIsLoading = () => useChatStoreBase((state) => state.isLoading);
export const useIsStreaming = () =>
  useChatStoreBase((state) => state.isStreaming);
export const useConversationId = () =>
  useChatStoreBase((state) => state.conversationId);
export const useTokenCount = () =>
  useChatStoreBase((state) => state.tokenCount);
export const useIsCalculatingTokens = () =>
  useChatStoreBase((state) => state.isCalculatingTokens);

// Export actions as a single hook
export const useChatActions = () => useChatStoreBase((state) => state.actions);
