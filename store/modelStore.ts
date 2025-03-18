import { ModelService } from "@/db/services/model-service";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Interface for a model in the store
 */
export type Model = Awaited<
  ReturnType<typeof ModelService.getActiveModels>
>[number];

/**
 * Interface for the model store state
 */
interface ModelState {
  /** Currently selected model ID */
  selectedModelId: string;
  /** Error message if loading fails */
  error: string | null;
  /** Flag indicating if the store has been hydrated */
  hydrated: boolean;

  /**
   * Sets the selected model ID
   * @param modelId - The model ID to select
   */
  setSelectedModelId: (modelId: string) => void;

  /**
   * Sets the error message
   * @param error - The error message to set
   */
  setError: (error: string | null) => void;

  /** Sets the hydrated flag */
  setHydrated: (hydrated: boolean) => void;
}

/**
 * Default model ID to use if none is in localStorage
 */
const DEFAULT_MODEL_ID = "mistral-small-latest";

/**
 * Zustand store for managing model selection
 * Uses persist middleware to save the selected model ID to localStorage
 */
export const useModelStore = create<ModelState>()(
  persist(
    (set) => ({
      selectedModelId: DEFAULT_MODEL_ID,
      error: null,
      hydrated: false,

      setSelectedModelId: (modelId: string) => {
        set({ selectedModelId: modelId });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setHydrated: (hydrated: boolean) => {
        set({ hydrated });
      },
    }),
    {
      name: "model-storage",
      partialize: (state) => ({ selectedModelId: state.selectedModelId }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      },
    },
  ),
);
