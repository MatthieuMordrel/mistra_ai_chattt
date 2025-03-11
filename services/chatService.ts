import { MistralMessage, streamMistralClient } from "@/lib/mistral-client";
import { ChatMessage } from "@/types/types";

/**
 * Options for sending a message
 */
interface SendMessageOptions {
  /** The current messages in the chat */
  currentMessages: ChatMessage[];
  /** The new user message to send */
  userMessage: ChatMessage;
  /** Callback for updating the assistant message with each token */
  onTokenUpdate: (assistantMessageIndex: number, token: string) => void;
  /** Callback when streaming is complete */
  onComplete: (assistantMessageIndex: number) => void;
  /** Callback for error handling */
  onError: (assistantMessageIndex: number, errorMessage: string) => void;
}

/**
 * Convert chat messages to Mistral API format
 */
const convertToMistralMessages = (
  messages: ChatMessage[],
): MistralMessage[] => {
  return messages.map(({ role, content }) => {
    if (role === "user") {
      return {
        role: "user" as const,
        content,
      };
    } else if (role === "assistant") {
      return {
        role: "assistant" as const,
        content,
        prefix: false,
      };
    } else {
      return {
        role: "system" as const,
        content,
      };
    }
  });
};

/**
 * Send a message to the Mistral AI API
 */
export const sendMessage = async ({
  currentMessages,
  userMessage,
  onTokenUpdate,
  onComplete,
  onError,
}: SendMessageOptions): Promise<void> => {
  const assistantMessageIndex = currentMessages.length + 1;
  const allMessages = [...currentMessages, userMessage];

  try {
    // Convert chat messages to Mistral API format
    const mistralMessages = convertToMistralMessages(allMessages);

    // Stream the response using our protected API client
    await streamMistralClient({
      messages: mistralMessages,
      onToken: (token) => {
        onTokenUpdate(assistantMessageIndex, token);
      },
      onComplete: () => {
        onComplete(assistantMessageIndex);
      },
      onError: (error) => {
        console.error("Error streaming response:", error);
        onError(
          assistantMessageIndex,
          "Sorry, there was an error generating a response. Please try again.",
        );
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);
    onError(
      assistantMessageIndex,
      "Sorry, there was an error generating a response. Please try again.",
    );
  }
};
