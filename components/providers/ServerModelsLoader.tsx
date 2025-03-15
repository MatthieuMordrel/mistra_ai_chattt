import { ModelService } from "@/db/services/model-service";
import { ModelsProvider } from "./ModelsProvider";

/**
 * Server component that fetches models and passes them to the client ModelsProvider
 * This component should be placed in the layout to ensure models are loaded once
 * and available throughout the application
 */
export async function ServerModelsLoader() {
  // Fetch models on the server
  const models = await ModelService.getActiveModels();

  return <ModelsProvider models={models} />;
}
