import "server-only";

import { db } from "@/db/database";
import { model } from "@/db/schema/chat-schema";
import { eq } from "drizzle-orm";

/**
 * Service for handling database operations related to AI models
 */
export const modelService = {
  queries: {
    /**
     * Get all active models from the database
     */
    getActiveModels: async () => {
      return db
        .select()
        .from(model)
        .where(eq(model.isActive, true))
        .orderBy(model.name);
    },

    /**
     * Get a model by ID
     * @param modelId - The ID of the model to get
     */
    getModelById: async (modelId: string) => {
      const result = await db.select().from(model).where(eq(model.id, modelId));

      return result[0] || null;
    },
  },
};
