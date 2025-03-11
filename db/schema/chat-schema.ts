import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

/**
 * Conversation table to store chat conversations
 */
export const conversation = pgTable("conversation", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("New Conversation"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Message table to store individual messages in conversations
 */
export const message = pgTable("message", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversation.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  tokens: integer("tokens"), // Optional token count for tracking usage
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * Model table to store information about available AI models
 */
export const model = pgTable("model", {
  id: text("id").primaryKey(), // e.g., 'mistral-small', 'mistral-medium', 'mistral-large'
  name: text("name").notNull(), // Display name
  description: text("description"),
  contextWindow: integer("context_window"), // Maximum context window size
  inputPricePerToken: numeric("input_price_per_token"), // Price per input token (e.g., $0.00002)
  outputPricePerToken: numeric("output_price_per_token"), // Price per output token (e.g., $0.00006)
  // Model capabilities
  canCompletionChat: boolean("can_completion_chat").default(false),
  canCompletionFim: boolean("can_completion_fim").default(false),
  canFunctionCalling: boolean("can_function_calling").default(false),
  canFineTuning: boolean("can_fine_tuning").default(false),
  canVision: boolean("can_vision").default(false),
  maxContextLength: integer("max_context_length"), // Same as contextWindow but using Mistral's naming
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
