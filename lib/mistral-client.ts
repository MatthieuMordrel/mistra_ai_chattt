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

// Types for the streaming response data
type StreamChunk = components["schemas"]["CompletionChunk"];
type StreamChoice = components["schemas"]["CompletionResponseStreamChoice"];
type DeltaMessage = components["schemas"]["DeltaMessage"];

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
  /** Advanced callback for raw chunk data (for debugging or advanced use cases) */
  onChunk?: (chunk: StreamChunk) => void;
}

/**
 * Parses an SSE message line and extracts the StreamChunk data
 * @param line A line from the SSE stream (starting with "data: ")
 * @returns Parsed StreamChunk or null if parsing failed or it's a control message
 */
function parseSSELine(line: string): StreamChunk | null {
  // Skip empty lines or non-data lines
  if (!line.trim() || !line.startsWith("data: ")) {
    return null;
  }

  // Extract the JSON part (removing "data: " prefix)
  const jsonStr = line.substring(6).trim();

  // Handle the special "[DONE]" message
  if (jsonStr === "[DONE]") {
    return null;
  }

  try {
    // Parse and cast to StreamChunk type
    return JSON.parse(jsonStr) as StreamChunk;
  } catch (error) {
    console.error("Error parsing SSE line:", error);
    return null;
  }
}

/**
 * Extracts content from a StreamChunk if available
 * @param chunk The parsed StreamChunk
 * @returns The content string or null if no content is available
 */
function extractContentFromChunk(chunk: StreamChunk): string | null {
  // Check if we have choices and delta content
  if (!chunk.choices || !chunk.choices[0] || !chunk.choices[0].delta) {
    return null;
  }

  const delta = chunk.choices[0].delta;

  // Handle string content
  if (typeof delta.content === "string") {
    return delta.content;
  }

  // Handle content array (for multi-modal responses)
  if (Array.isArray(delta.content)) {
    return delta.content
      .map((item) => ("text" in item ? item.text : ""))
      .join("");
  }

  return null;
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
  onToken = (token: string) => {},
  onComplete = (fullText: string) => {},
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
