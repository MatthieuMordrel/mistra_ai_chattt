import { components } from "./mistral";

/**
 * Chat message interface for the UI
 */
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
}

/**
 * Mistral API message type
 */
export type MistralMessage =
  | components["schemas"]["SystemMessage"]
  | components["schemas"]["UserMessage"]
  | components["schemas"]["AssistantMessage"]
  | components["schemas"]["ToolMessage"];

/**
 * Conversation interface for the UI
 */
export interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}
