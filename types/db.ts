import { conversation, message, model } from "@/db/schema/chat-schema";
import { InferSelectModel } from "drizzle-orm";

/**
 * Inferred types from Drizzle schema
 */
export type Conversation = InferSelectModel<typeof conversation>;
export type Message = InferSelectModel<typeof message>;
export type Model = InferSelectModel<typeof model>;

export type MessageWithIsStreaming = Message & { isStreaming: boolean };

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
