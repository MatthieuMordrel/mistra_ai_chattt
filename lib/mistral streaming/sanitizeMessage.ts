import { MistralMessage } from "@/types/types";
import { BasicMessage } from "./types";

/**
 * Sanitize messages to ensure they conform to Mistral API requirements
 * This handles proper formatting based on message role
 */
export function sanitizeMessages(messages: BasicMessage[]): MistralMessage[] {
  return messages.map((message) => {
    if (message.role === "assistant") {
      return {
        role: "assistant" as const,
        content: message.content || "Empty response from assistant",
        prefix: false, // Only include prefix for assistant messages
      };
    } else if (message.role === "user") {
      return {
        role: "user" as const,
        content: message.content || "Empty response from user",
      };
    } else if (message.role === "system") {
      return {
        role: "system" as const,
        content: message.content || "Empty response from system",
      };
    } else {
      // Default to user message for any unknown roles
      return {
        role: "user" as const,
        content: message.content || "Empty response from unknown role",
      };
    }
  });
}
