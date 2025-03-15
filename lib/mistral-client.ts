import { components, MistralMessage } from "@/types/mistral";

/**
 * Basic message interface that can be converted to Mistral API format
 */
export interface BasicMessage {
  role: string; // Accept any string for role to be compatible with database Message type
  content: string;
  [key: string]: any; // Allow for additional properties
}

/**
 * Sanitize messages to ensure they conform to Mistral API requirements
 * This handles proper formatting based on message role
 */
export function sanitizeMessages(messages: BasicMessage[]): MistralMessage[] {
  return messages.map((message) => {
    if (message.role === "assistant") {
      return {
        role: "assistant" as const,
        content: message.content,
        prefix: false, // Only include prefix for assistant messages
      };
    } else if (message.role === "user") {
      return {
        role: "user" as const,
        content: message.content,
      };
    } else if (message.role === "system") {
      return {
        role: "system" as const,
        content: message.content,
      };
    } else {
      // Default to user message for any unknown roles
      return {
        role: "user" as const,
        content: message.content,
      };
    }
  });
}

/**
 * Options for the streamMistralClient function
 */
export interface StreamMistralClientOptions {
  /** The model ID to use (defaults to mistral-small-latest) */
  model?: string;
  /** Array of messages for the conversation */
  messages: BasicMessage[];
  /** Temperature for generation (0.0-1.0) */
  temperature?: number;
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Response format (defaults to text) */
  responseFormat?: components["schemas"]["ResponseFormat"];
  /** Callback for each token as it's received */
  onToken?: (token: string) => void;
  /** Callback when streaming is complete with the full text */
  onComplete?: (fullText: string) => void;
  /** Callback for error handling */
  onError?: (error: Error) => void;
}

/**
 * Stream responses from the Mistral AI API through our protected API endpoint
 *
 * @example
 * ```typescript
 * await streamMistralClient({
 *   messages: [{ role: "user", content: "Tell me about Paris" }],
 *   onToken: (token) => setPartialResponse(prev => prev + token),
 *   onComplete: (fullText) => console.log("Completed!"),
 * });
 * ```
 */
export async function streamMistralClient({
  model = "mistral-small-latest",
  messages,
  temperature,
  maxTokens,
  responseFormat = { type: "text" },
  onToken = (token: string) => {},
  onComplete = (fullText: string) => {},
  onError = (error: Error) => console.error(error),
}: StreamMistralClientOptions): Promise<string> {
  try {
    // Sanitize messages to ensure they conform to Mistral API requirements
    const sanitizedMessages = sanitizeMessages(messages);

    // Call our protected API endpoint
    const response = await fetch("/api/mistral/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: sanitizedMessages,
        temperature,
        maxTokens,
        responseFormat,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    if (!response.body) {
      throw new Error("No response body received.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Decode the chunk and add it to our buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete lines from the buffer
      const lines = buffer.split("\n");
      // Keep the last (potentially incomplete) line in the buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        // Skip empty lines
        if (!line.trim()) continue;

        // Handle SSE format - lines starting with "data: "
        if (line.startsWith("data: ")) {
          const jsonStr = line.substring(6); // Remove "data: " prefix

          // Handle the special "[DONE]" message that some SSE APIs use
          if (jsonStr.trim() === "[DONE]") {
            continue;
          }

          try {
            const data = JSON.parse(jsonStr);

            // Extract and use the content if available
            if (
              data.choices &&
              data.choices[0].delta &&
              data.choices[0].delta.content
            ) {
              const content = data.choices[0].delta.content;
              fullContent += content;
              // Call the token callback
              onToken(content);
            }
          } catch (error) {
            if (error instanceof Error) {
              onError(error);
            } else {
              onError(new Error("Unknown error parsing JSON"));
            }
          }
        }
      }
    }

    // Call the completion callback with the full content
    onComplete(fullContent);
    return fullContent;
  } catch (error) {
    if (error instanceof Error) {
      onError(error);
    } else {
      onError(new Error("Unknown error occurred"));
    }
    throw error;
  }
}
