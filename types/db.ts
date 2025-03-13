import { conversation, message, model } from "@/db/schema/chat-schema";
import { InferSelectModel } from "drizzle-orm";

/**
 * Inferred types from Drizzle schema
 */
export type ConversationDB = InferSelectModel<typeof conversation>;
export type MessageDB = InferSelectModel<typeof message>;
export type ModelDB = InferSelectModel<typeof model>;

export type MessageWithIsStreaming = MessageDB & { isStreaming: boolean };

/**
 * Type for conversation with messages
 */
export interface ConversationWithMessages {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: MessageWithIsStreaming[];
}
