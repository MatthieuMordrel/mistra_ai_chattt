import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { db } from "../db/database";
import { model } from "../db/schema/chat-schema";
import { components } from "../types/mistral";

const { combinedEnv } = loadEnvConfig(process.cwd());

// Type definitions for models.json
interface LocalModelData {
  id: string;
  name: string;
  description: string;
  inputPricePerToken: number;
  outputPricePerToken: number;
}

// Use Mistral API types
type MistralModelResponse =
  | components["schemas"]["BaseModelCard"]
  | components["schemas"]["FTModelCard"];

async function fetchModelFromMistral(
  modelId: string,
): Promise<MistralModelResponse | null> {
  try {
    const apiKey = combinedEnv.MISTRAL_API_KEY;
    if (!apiKey) {
      console.error("MISTRAL_API_KEY is not set in environment variables");
      return null;
    }

    const response = await fetch(
      `https://api.mistral.ai/v1/models/${modelId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error(
        `Error fetching model ${modelId} from Mistral API: ${response.status} ${response.statusText}`,
        errorData,
      );
      return null;
    }

    return (await response.json()) as MistralModelResponse;
  } catch (error) {
    console.error(`Error fetching model ${modelId} from Mistral API:`, error);
    return null;
  }
}

async function populateModels() {
  try {
    // Read models from JSON file
    const modelsFilePath = path.join(process.cwd(), "models.json");
    const modelsData: LocalModelData[] = JSON.parse(
      fs.readFileSync(modelsFilePath, "utf-8"),
    );

    console.log(`Found ${modelsData.length} models in models.json`);

    for (const localModel of modelsData) {
      console.log(`Processing model: ${localModel.id}`);

      // Fetch additional data from Mistral API
      const mistralModel = await fetchModelFromMistral(localModel.id);

      if (mistralModel) {
        console.log(
          `Successfully fetched data for ${localModel.id} from Mistral API`,
        );

        // Prepare model data for database
        const modelData = {
          id: localModel.id,
          name: localModel.name,
          description: localModel.description,
          inputPricePerToken: localModel.inputPricePerToken.toString(),
          outputPricePerToken: localModel.outputPricePerToken.toString(),
          contextWindow: mistralModel.max_context_length,
          maxContextLength: mistralModel.max_context_length,
          canCompletionChat: mistralModel.capabilities.completion_chat,
          canCompletionFim: mistralModel.capabilities.completion_fim,
          canFunctionCalling: mistralModel.capabilities.function_calling,
          canFineTuning:
            "fine_tuning" in mistralModel.capabilities
              ? mistralModel.capabilities.fine_tuning
              : false,
          canVision:
            "vision" in mistralModel.capabilities
              ? mistralModel.capabilities.vision
              : false,
          isActive: true,
          updatedAt: new Date(),
        };

        // Check if model already exists
        const existingModel = await db
          .select()
          .from(model)
          .where(eq(model.id, localModel.id));

        if (existingModel.length > 0) {
          // Update existing model
          console.log(`Updating existing model: ${localModel.id}`);
          await db
            .update(model)
            .set(modelData)
            .where(eq(model.id, localModel.id));
        } else {
          // Insert new model
          console.log(`Inserting new model: ${localModel.id}`);
          await db.insert(model).values({
            ...modelData,
            createdAt: new Date(),
          });
        }
      } else {
        console.warn(
          `Could not fetch data for ${localModel.id} from Mistral API. Using local data only.`,
        );

        // Insert with local data only
        const modelData = {
          id: localModel.id,
          name: localModel.name,
          description: localModel.description,
          inputPricePerToken: localModel.inputPricePerToken.toString(),
          outputPricePerToken: localModel.outputPricePerToken.toString(),
          isActive: true,
          updatedAt: new Date(),
        };

        // Check if model already exists
        const existingModel = await db
          .select()
          .from(model)
          .where(eq(model.id, localModel.id));

        if (existingModel.length > 0) {
          // Update existing model
          console.log(
            `Updating existing model with local data only: ${localModel.id}`,
          );
          await db
            .update(model)
            .set(modelData)
            .where(eq(model.id, localModel.id));
        } else {
          // Insert new model
          console.log(
            `Inserting new model with local data only: ${localModel.id}`,
          );
          await db.insert(model).values({
            ...modelData,
            createdAt: new Date(),
          });
        }
      }
    }

    console.log("Model population completed successfully");
  } catch (error) {
    console.error("Error populating models:", error);
  }
}

// Run the script
populateModels().catch(console.error);
