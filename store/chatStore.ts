import { countMessageTokens } from "@/lib/mistral streaming/tokenizer";
import { ChatMessage } from "@/types/types";
import { create } from "zustand";

interface TokenState {
  tokenCount: number;
  isCalculatingTokens: boolean;
  actions: {
    setTokenCount: (count: number) => void;
    incrementTokenCount: (increment: number) => void;
    setCalculatingTokens: (isCalculating: boolean) => void;
    resetTokenCount: () => void;
    calculateTokenCount: (messages: ChatMessage[]) => Promise<void>;
  };
}

/**
 * Zustand store for managing token count
 */
export const useTokenStoreBase = create<TokenState>((set, get) => ({
  tokenCount: 0,
  isCalculatingTokens: false,
  actions: {
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

    resetTokenCount: () => {
      set({
        tokenCount: 0,
        isCalculatingTokens: false,
      });
    },

    calculateTokenCount: async (messages: ChatMessage[]) => {
      const actions = get().actions;

      try {
        actions.setCalculatingTokens(true);
        const count = await countMessageTokens(messages);
        actions.setTokenCount(count);
      } catch (error) {
        console.error("Error calculating token count:", error);
      } finally {
        actions.setCalculatingTokens(false);
      }
    },
  },
}));

// Export atomic selectors as custom hooks
export const useTokenCount = () =>
  useTokenStoreBase((state) => state.tokenCount);
export const useIsCalculatingTokens = () =>
  useTokenStoreBase((state) => state.isCalculatingTokens);

// Export actions as a single hook
export const useTokenActions = () =>
  useTokenStoreBase((state) => state.actions);
