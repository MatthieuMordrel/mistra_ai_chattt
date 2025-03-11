import { ChatMessage } from "@/types/types";

/**
 * Options for sending a message to the API
 */
interface SendMessageOptions {
  /** Current messages in the conversation */
  currentMessages: ChatMessage[];
  /** The new user message to send */
  userMessage: ChatMessage;
  /** Callback for token updates during streaming */
  onTokenUpdate?: (fullMessage: string, token: string) => void;
  /** Callback when the response is complete */
  onComplete?: (response: ChatMessage) => void;
  /** Callback for errors */
  onError?: (error: Error, message: string) => void;
}

/**
 * Sends a message to the Mistral API and handles streaming the response
 */
export async function sendMessage({
  currentMessages,
  userMessage,
  onTokenUpdate,
  onComplete,
  onError,
}: SendMessageOptions): Promise<void> {
  try {
    // Prepare the request body
    const body = JSON.stringify({
      messages: [...currentMessages],
    });

    // Send the request to our API endpoint
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to send message");
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }

    let fullMessage = "";
    let assistantMessage: ChatMessage = {
      role: "assistant",
      content: "",
    };

    // Process the stream
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Convert the chunk to text
      const chunk = new TextDecoder().decode(value);

      try {
        // Each chunk might contain multiple JSON objects
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            // Check if it's the [DONE] marker
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);

              if (parsed.choices && parsed.choices[0]) {
                const { delta, finish_reason } = parsed.choices[0];

                // If there's content in the delta, update the message
                if (delta.content) {
                  fullMessage += delta.content;
                  assistantMessage.content = fullMessage;

                  // Call the token update callback
                  onTokenUpdate?.(fullMessage, delta.content);
                }

                // If the response is complete, call the completion callback
                if (finish_reason === "stop") {
                  onComplete?.(assistantMessage);
                }
              }
            } catch (e) {
              console.error("Error parsing JSON:", e);
            }
          }
        }
      } catch (e) {
        console.error("Error processing chunk:", e);
      }
    }

    // Ensure the completion callback is called if it wasn't called during streaming
    if (assistantMessage.content && onComplete) {
      onComplete(assistantMessage);
    }
  } catch (error) {
    console.error("Error in sendMessage:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    onError?.(
      error instanceof Error ? error : new Error("Unknown error"),
      errorMessage,
    );

    throw error;
  }
}
