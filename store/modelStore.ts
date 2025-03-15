import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Interface for a model in the store
 */
export type Model = {
  id: string;
  name: string;
  description?: string | null;
  contextWindow?: number | null;
  inputPricePerToken?: string | null;
  outputPricePerToken?: string | null;
  canCompletionChat?: boolean | null;
  canCompletionFim?: boolean | null;
  canFunctionCalling?: boolean | null;
  canFineTuning?: boolean | null;
  canVision?: boolean | null;
  maxContextLength?: number | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

/**
 * Interface for the model store state
 */
interface ModelState {
  /** Array of available models */
  models: Model[];
  /** Currently selected model ID */
  selectedModelId: string;
  /** Flag indicating if models are being loaded */
  isLoading: boolean;
  /** Error message if loading fails */
  error: string | null;

  /**
   * Sets the available models
   * @param models - The models to set
   */
  setModels: (models: Model[]) => void;

  /**
   * Sets the selected model ID
   * @param modelId - The model ID to select
   */
  setSelectedModelId: (modelId: string) => void;

  /**
   * Sets the loading state
   * @param isLoading - The loading state to set
   */
  setLoading: (isLoading: boolean) => void;

  /**
   * Sets the error message
   * @param error - The error message to set
   */
  setError: (error: string | null) => void;
}

/**
 * Zustand store for managing model selection
 * Uses persist middleware to save the selected model ID to localStorage
 */
export const useModelStore = create<ModelState>()(
  persist(
    (set) => ({
      models: [],
      selectedModelId: "mistral-small-latest", // Default model
      isLoading: false,
      error: null,

      setModels: (models: Model[]) => {
        set({ models });
      },

      setSelectedModelId: (modelId: string) => {
        set({ selectedModelId: modelId });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: "model-storage", // Name for the localStorage key
      partialize: (state) => ({ selectedModelId: state.selectedModelId }), // Only persist the selected model ID
    },
  ),
);
