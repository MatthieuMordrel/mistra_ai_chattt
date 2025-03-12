import { streamMistralClient } from "@/lib/mistral-client";
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
    // Stream the response using our protected API client
    await streamMistralClient({
      messages: allMessages,
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
