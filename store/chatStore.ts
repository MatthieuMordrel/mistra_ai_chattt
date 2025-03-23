/**
 * Chat service for sending messages to the API
 */
import { ChatMessage } from "@/types/types";
import { create } from "zustand";

/**
 * Interface for the chat UI state
 */
interface ChatState {
  /** Array of chat messages in the current conversation */
  messages: ChatMessage[];
  /** Flag indicating if a message is currently being processed */
  isLoading: boolean;
  /** Flag indicating if the current message is streaming */
  isStreaming: boolean;
  /** Current conversation ID */
  conversationId: string | null;
  /** Current conversation title */
  conversationTitle: string;
  /** Current token count of the conversation */
  tokenCount: number;
  /** Flag indicating if token count is being calculated */
  isCalculatingTokens: boolean;
  /** Actions that can be performed on the store */
  actions: {
    /**
     * Sets all messages at once
     * @param messages - The messages to set
     */
    setMessages: (messages: ChatMessage[]) => void;

    /**
     * Adds a user message to the chat
     * @param message - The message text to add
     */
    addUserMessage: (message: string) => void;

    /**
     * Adds an assistant message to the chat
     * @param message - The message text to add
     * @param isStreaming - Whether the message is still streaming
     */
    addAssistantMessage: (message: string, isStreaming?: boolean) => void;

    /**
     * Updates the assistant's message during streaming
     * @param message - The updated message text
     */
    updateAssistantMessage: (message: string) => void;

    /**
     * Sets the loading state
     * @param isLoading - The loading state to set
     */
    setLoading: (isLoading: boolean) => void;

    /**
     * Sets the streaming state
     * @param isStreaming - The streaming state to set
     */
    setStreaming: (isStreaming: boolean) => void;

    /**
     * Sets the conversation ID
     * @param id - The conversation ID to set
     */
    setConversationId: (id: string | null) => void;

    /**
     * Sets the conversation title
     * @param title - The title to set
     */
    setConversationTitle: (title: string) => void;

    /**
     * Sets the token count
     * @param count - The token count to set
     */
    setTokenCount: (count: number) => void;

    /**
     * Increments the token count (for streaming)
     * @param increment - The number of tokens to add
     */
    incrementTokenCount: (increment: number) => void;

    /**
     * Sets the calculating tokens state
     * @param isCalculating - Whether tokens are being calculated
     */
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
 * Not exported directly to prevent subscribing to the entire store
 */
export const useChatStoreBase = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  conversationTitle: "",
  isStreaming: false,
  conversationId: null,
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

    setConversationId: (id: string | null) => {
      set({ conversationId: id });
    },

    setConversationTitle: (title: string) => {
      set({ conversationTitle: title });
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
        conversationTitle: "New Chat",
        conversationId: null,
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
export const useConversationTitle = () =>
  useChatStoreBase((state) => state.conversationTitle);
export const useTokenCount = () =>
  useChatStoreBase((state) => state.tokenCount);
export const useIsCalculatingTokens = () =>
  useChatStoreBase((state) => state.isCalculatingTokens);

// Export actions as a single hook
export const useChatActions = () => useChatStoreBase((state) => state.actions);
