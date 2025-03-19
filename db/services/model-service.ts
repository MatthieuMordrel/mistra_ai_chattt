import { db } from "@/db/database";
import { model } from "@/db/schema/chat-schema";
import { eq } from "drizzle-orm";
import "server-only";

/**
 * Service for handling database operations related to AI models
 */
export class ModelService {
  /**
   * Get all active models from the database
   * @returns An array of active models
   */
  static async getActiveModels() {
    return db
      .select()
      .from(model)
      .where(eq(model.isActive, true))
      .orderBy(model.name);
  }

  /**
   * Get a model by ID
   * @param modelId The ID of the model to get
   * @returns The model with the specified ID, or null if not found
   */
  static async getModelById(modelId: string) {
    const result = await db.select().from(model).where(eq(model.id, modelId));

    return result[0] || null;
  }
}
