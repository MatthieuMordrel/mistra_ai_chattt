"use client";

import { Model, useModelStore } from "@/store/modelStore";
import { useEffect } from "react";

/**
 * Client component that hydrates the model store with server-fetched models
 * This should be placed high in the component tree (e.g., in the layout)
 * to ensure models are available throughout the application
 */
export function ModelsProvider({ models }: { models: Model[] }) {
  const setModels = useModelStore((state) => state.setModels);
  const storeModels = useModelStore((state) => state.models);

  // Hydrate the store with server-fetched models if the store is empty
  useEffect(() => {
    if (
      models &&
      models.length > 0 &&
      (!storeModels || storeModels.length === 0)
    ) {
      setModels(models);
    }
  }, [models, setModels, storeModels]);

  // This component doesn't render anything
  return null;
}
