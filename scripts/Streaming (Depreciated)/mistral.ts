import { components } from "../../types/mistral";

/**
 * Message type for Mistral API
 */
export type MistralMessage =
  | components["schemas"]["SystemMessage"]
  | components["schemas"]["UserMessage"]
  | components["schemas"]["AssistantMessage"]
  | components["schemas"]["ToolMessage"];

/**
 * Options for the streamMistral function
 */
export interface StreamMistralOptions {
  /** The model ID to use (defaults to mistral-small-latest) */
  model?: string;
  /** Array of messages for the conversation */
  messages: MistralMessage[];
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
 * Stream responses from the Mistral AI API
 *
 * @example
 * ```typescript
 * await streamMistral({
 *   messages: [{ role: "user", content: "Tell me about Paris" }],
 *   onToken: (token) => process.stdout.write(token),
 *   onComplete: (fullText) => console.log("\nDone!"),
 * });
 * ```
 */
export async function streamMistral({
  model = "mistral-small-latest",
  messages,
  temperature,
  maxTokens,
  responseFormat = { type: "text" },
  onToken = (token: string) => process.stdout.write(token),
  onComplete = (fullText: string) => {},
  onError = (error: Error) => console.error(error),
}: StreamMistralOptions): Promise<string> {
  try {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages,
        temperature,
        max_tokens: maxTokens,
        response_format: responseFormat,
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
