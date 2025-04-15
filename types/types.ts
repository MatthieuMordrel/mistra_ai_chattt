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
 * Request body interface for the Mistral streaming API
 */
export interface MistralStreamRequest {
  model?: string;
  messages: MistralMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: components["schemas"]["ResponseFormat"];
}
