import { saveMessagesAction } from "@/actions/conversation-actions";
import { streamMistralClient } from "@/lib/mistral-client";
import { useChatStore } from "@/store/chatStore";
import { ChatMessage } from "@/types/types";

/**
 * Options for sending a message
 */
interface SendMessageOptions {
  /** The current messages in the conversation */
  currentMessages: ChatMessage[];
  /** The new user message to send */
  userMessage: ChatMessage;
  /** The conversation ID to save messages to (if available) */
  conversationId: string;
  /** Optional callbacks for custom handling */
  callbacks?: {
    /** Called before sending the message */
    onStart?: () => void;
    /** Called when streaming is complete */
    onComplete?: (fullContent: string) => void;
    /** Called when an error occurs */
    onError?: (errorMessage: string) => void;
  };
}

/**
 * Prepares the UI state before sending a message
 * Sets up the chat store with appropriate states
 *
 * @param currentMessages - Current messages in the conversation
 * @param userMessage - The user message being sent
 */
const prepareUIState = (): void => {
  // Add empty assistant message and set loading state
  useChatStore.getState().addAssistantMessage("", true);
  useChatStore.getState().setLoading(true);
  useChatStore.getState().setStreaming(true);
};

/**
 * Saves an assistant message to the database
 *
 * @param conversationId - The ID of the conversation
 * @param content - The content of the message
 * @returns A promise that resolves when the message is saved
 */
const saveAssistantMessageToDb = async (
  content: string,
  conversationId: string,
): Promise<void> => {
  try {
    await saveMessagesAction(conversationId, [
      {
        role: "assistant",
        content,
      },
    ]);
  } catch (error) {
    console.error("Error saving assistant message to database:", error);
    // Continue even if saving fails - the UI will still show the message
  }
};

/**
 * Updates the UI state after streaming is complete
 *
 * @param content - The final content of the assistant message
 */
const updateUIAfterStreaming = (content: string): void => {
  useChatStore.getState().updateAssistantMessage(content);
  useChatStore.getState().setLoading(false);
  useChatStore.getState().setStreaming(false);
};

/**
 * Handles errors during message streaming
 *
 * @param error - The error that occurred
 * @param errorCallback - Optional callback for custom error handling
 * @returns An error message
 */
const handleStreamingError = (
  error: unknown,
  errorCallback?: (errorMessage: string) => void,
): string => {
  console.error("Error streaming response:", error);
  const errorMessage =
    "Sorry, there was an error generating a response. Please try again.";

  // Update UI with error
  updateUIAfterStreaming(errorMessage);

  // Call the error callback if provided
  errorCallback?.(errorMessage);

  return errorMessage;
};

/**
 * Streams a message to the Mistral AI API and processes the response
 *
 * @param messagesToSend - Messages to send to the API
 * @param onToken - Callback for each token received
 * @param onComplete - Callback when streaming is complete
 * @param onError - Callback when an error occurs
 * @returns A promise that resolves when streaming is complete
 */
const streamMessageToAPI = async (
  messagesToSend: ChatMessage[],
  onToken: (token: string) => void,
  onComplete: (fullContent: string) => void,
  onError: (error: Error) => void,
): Promise<void> => {
  await streamMistralClient({
    model: "mistral-small-latest",
    messages: messagesToSend,
    onToken,
    onComplete,
    onError,
  });
};

/**
 * Send a message to the Mistral AI API and handle streaming response
 * This function orchestrates the message sending process by calling more specialized functions
 *
 * @param options - The options for sending a message
 * @returns A promise that resolves when the message is sent and the response is processed
 */
export const streamAssistantMessageAndSaveToDb = async ({
  currentMessages,
  userMessage,
  conversationId,
  callbacks,
}: SendMessageOptions): Promise<void> => {
  // Call the onStart callback if provided
  callbacks?.onStart?.();

  // Prepare UI state
  prepareUIState();

  // Initialize a variable to accumulate the streaming content
  let accumulatedContent = "";

  try {
    // Stream the response using our protected API client
    await streamMessageToAPI(
      currentMessages,
      // Token callback
      (token) => {
        // Make sure streaming flag is set to true during token streaming
        if (!useChatStore.getState().isStreaming) {
          useChatStore.getState().setStreaming(true);
        }

        // Accumulate the content and update the UI with each token
        accumulatedContent += token;
        useChatStore.getState().updateAssistantMessage(accumulatedContent);
      },
      // Complete callback
      async (fullContent) => {
        // Update UI state
        updateUIAfterStreaming(fullContent);
        // Call the completion callback if provided
        callbacks?.onComplete?.(fullContent);
        // Save the assistant message to the database
        await saveAssistantMessageToDb(fullContent, conversationId);
      },
      // Error callback
      (error) => handleStreamingError(error, callbacks?.onError),
    );
  } catch (error) {
    handleStreamingError(error, callbacks?.onError);
  }
};
