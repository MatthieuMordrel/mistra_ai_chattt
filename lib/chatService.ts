import { saveMessagesAction } from "@/actions/conversation-actions";
import { streamMistralClient } from "@/lib/mistral streaming/mistral-client";
import {
  countMessageTokens,
  estimateTokenCount,
} from "@/lib/mistral streaming/tokenizer";
import { useChatStoreBase } from "@/store/chatStore";
import { useModelStoreBase } from "@/store/modelStore";
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
  useChatStoreBase.getState().actions.addAssistantMessage("", true);
  useChatStoreBase.getState().actions.setLoading(true);
  useChatStoreBase.getState().actions.setStreaming(true);
};

/**
 * Counts tokens for the current conversation and updates the UI
 * @param messages Current messages in the conversation
 */
const calculateAndUpdateTokenCount = async (
  messages: ChatMessage[],
): Promise<void> => {
  try {
    // Set calculating state to true
    useChatStoreBase.getState().actions.setCalculatingTokens(true);

    // Calculate token count for all messages
    const count = await countMessageTokens(messages);

    // Update the token count in the store
    useChatStoreBase.getState().actions.setTokenCount(count);
  } catch (error) {
    console.error("Error calculating token count:", error);
  } finally {
    // Always reset calculating state
    useChatStoreBase.getState().actions.setCalculatingTokens(false);
  }
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
  useChatStoreBase.getState().actions.updateAssistantMessage(content);
  useChatStoreBase.getState().actions.setLoading(false);
  useChatStoreBase.getState().actions.setStreaming(false);
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
 * Send a message to the Mistral AI API and handle streaming response
 * This function orchestrates the message sending process
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

  // Calculate initial token count for the conversation
  calculateAndUpdateTokenCount(currentMessages);

  // Initialize a variable to accumulate the streaming content
  let accumulatedContent = "";

  try {
    // Get the selected model ID from the store
    const selectedModelId = useModelStoreBase.getState().selectedModelId;

    // Stream the response using our protected API client
    await streamMistralClient({
      model: selectedModelId || "mistral-small-latest", // Use selected model or fall back to default
      messages: currentMessages,
      // Token callback
      onToken: (token) => {
        // Accumulate the content and update the UI with each token
        accumulatedContent += token;
        useChatStoreBase
          .getState()
          .actions.updateAssistantMessage(accumulatedContent);

        // Estimate and increment token count for this piece
        const tokenEstimate = estimateTokenCount(token);
        if (tokenEstimate > 0) {
          useChatStoreBase
            .getState()
            .actions.incrementTokenCount(tokenEstimate);
        }
      },
      // Complete callback
      onComplete: async (fullContent) => {
        // Update UI state
        updateUIAfterStreaming(fullContent);
        // Call the completion callback if provided
        callbacks?.onComplete?.(fullContent);
        // Save the assistant message to the database
        await saveAssistantMessageToDb(fullContent, conversationId);
      },
      // Error callback
      onError: (error) => handleStreamingError(error, callbacks?.onError),
    });
  } catch (error) {
    handleStreamingError(error, callbacks?.onError);
  }
};
