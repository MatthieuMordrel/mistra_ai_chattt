/**
 * Chat service for sending messages to the API
 */
import { MessageWithIsStreaming } from "@/types/db";
import { create } from "zustand";

/**
 * Interface for the minimal chat UI state
 */
interface ChatState {
  /** Array of chat messages in the current conversation */
  messages: MessageWithIsStreaming[];
  /** Flag indicating if a message is currently being processed */
  isLoading: boolean;
  /** Flag indicating if the current message is streaming */
  isStreaming: boolean;
  /** Current conversation ID */
  conversationId: string | null;

  /**
   * Sets all messages at once
   * @param messages - The messages to set
   */
  setMessages: (messages: MessageWithIsStreaming[]) => void;

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
}

/**
 * Zustand store for managing chat UI state
 */
export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  conversationTitle: "New Conversation",
  isStreaming: false,
  conversationId: null,

  setMessages: (messages: MessageWithIsStreaming[]) => {
    set({ messages });
  },

  addUserMessage: (message: string) => {
    const userMessage: MessageWithIsStreaming = {
      role: "user",
      content: message,
      isStreaming: false,
      id: "",
      createdAt: new Date(),
      conversationId: "",
      tokens: null,
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
    }));
  },

  addAssistantMessage: (message: string, isStreaming = false) => {
    const assistantMessage: MessageWithIsStreaming = {
      role: "assistant",
      content: message,
      isStreaming,
      id: "",
      createdAt: new Date(),
      conversationId: "",
      tokens: null,
    };

    set((state) => ({
      messages: [...state.messages, assistantMessage],
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
}));
