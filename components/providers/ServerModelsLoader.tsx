import { ModelService } from "@/db/services/model-service";
import { ModelsProvider } from "./ModelsProvider";

/**
 * Server component that fetches models and passes them to the client ModelsProvider
 * This component is placed in the dashboard layout to ensure models are loaded once
 * and available throughout all dashboard routes, including the ModelSelector in the header
 */
export async function ServerModelsLoader() {
  // Fetch models on the server
  const models = await ModelService.getActiveModels();

  return <ModelsProvider models={models} />;
}
