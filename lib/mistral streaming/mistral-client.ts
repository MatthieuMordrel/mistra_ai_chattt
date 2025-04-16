import { components } from "@/types/mistral";
import { extractContentFromChunk } from "./extractFromChunk";
import { parseSSELine } from "./parseSSELine";
import { sanitizeMessages } from "./sanitizeMessage";
import { BasicMessage, StreamChunk } from "./types";

/**
 * Basic message interface that can be converted to Mistral API format
 */

/**
 * Options for the streamMistralClient function
 */
interface StreamMistralClientOptions {
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
  /** Advanced callback for raw chunk data (for debugging or advanced use cases) */
  onChunk?: (chunk: StreamChunk) => void;
}

/**
 * Stream responses from the Mistral AI API through our protected API endpoint
 *
 * @example
 * ```typescript
 * await streamMistralClient({
 *   messages: [{ role: "user", content: "Tell me about Paris" }],
 *   onToken: (token) => {
 *     setPartialResponse(prev => prev + token);
 *     // Handle token count estimation here if needed
 *     const tokenEstimate = estimateTokenCount(token);
 *     incrementTokenCount(tokenEstimate);
 *   },
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
  onToken = () => {},
  onComplete = () => {},
  onError = (error: Error) => console.error(error),
  onChunk,
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

    // Set up the stream reader and decoder
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullContent = "";

    // Process the stream
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

        // Parse the SSE line into a StreamChunk
        const chunk = parseSSELine(line);

        // Skip if parsing failed or it's a control message
        if (!chunk) continue;

        // Call onChunk callback if provided (for advanced usage)
        if (onChunk) {
          onChunk(chunk);
        }

        // Extract content from the chunk
        const content = extractContentFromChunk(chunk);

        // Process the content if available
        if (content) {
          fullContent += content;
          onToken(content);
        }
      }
    }

    // Process any remaining content in the buffer
    if (buffer.trim()) {
      const chunk = parseSSELine(buffer);
      if (chunk) {
        const content = extractContentFromChunk(chunk);
        if (content) {
          fullContent += content;
          onToken(content);
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
