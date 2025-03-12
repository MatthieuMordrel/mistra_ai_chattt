import { saveMessagesAction } from "@/app/actions/conversation-actions";
import { streamMistralClient } from "@/lib/mistral-client";
import { useChatStore } from "@/store/chatStore";
import { MessageWithIsStreaming } from "@/types/db";
import { ChatMessage } from "@/types/types";

/**
 * Options for sending a message
 */
interface SendMessageOptions {
  /** The current messages in the conversation */
  currentMessages: MessageWithIsStreaming[];
  /** The new user message to send */
  userMessage: ChatMessage;
  /** The conversation ID to save messages to (if available) */
  conversationId?: string | null;
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
 * Send a message to the Mistral AI API and handle streaming response
 * This function encapsulates all the logic for sending messages and processing responses
 * including state management through the chatStore
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

  // Add user message to the store if not already added by the component
  // This is a safety measure in case the component doesn't add the message
  const lastMessage = currentMessages[currentMessages.length - 1];
  if (
    !lastMessage ||
    lastMessage.role !== "user" ||
    lastMessage.content !== userMessage.content
  ) {
    useChatStore.getState().addUserMessage(userMessage.content);
  }

  // Add empty assistant message and set loading state
  useChatStore.getState().addAssistantMessage("", true);
  useChatStore.getState().setLoading(true);
  useChatStore.getState().setStreaming(true);

  // Create a messages array for the API
  const messagesToSend = [
    ...currentMessages,
    {
      role: userMessage.role,
      content: userMessage.content,
      isStreaming: false,
      id: "",
      createdAt: new Date(),
      conversationId: conversationId || "",
      tokens: null,
    },
  ];

  // Initialize a variable to accumulate the streaming content
  let accumulatedContent = "";

  try {
    // Stream the response using our protected API client
    await streamMistralClient({
      messages: messagesToSend,
      onToken: (token) => {
        // Make sure streaming flag is set to true during token streaming
        if (!useChatStore.getState().isStreaming) {
          useChatStore.getState().setStreaming(true);
        }

        // Accumulate the content and update the UI with each token
        accumulatedContent += token;
        useChatStore.getState().updateAssistantMessage(accumulatedContent);
      },
      onComplete: async (fullContent) => {
        // Save the assistant message to the database if we have a conversation ID
        if (conversationId) {
          try {
            await saveMessagesAction(conversationId, [
              {
                role: "assistant",
                content: fullContent,
              },
            ]);
          } catch (error) {
            console.error("Error saving assistant message to database:", error);
            // Continue even if saving fails - the UI will still show the message
          }
        }

        // Update UI state
        useChatStore.getState().updateAssistantMessage(fullContent);
        useChatStore.getState().setLoading(false);
        useChatStore.getState().setStreaming(false);

        // Call the completion callback if provided
        callbacks?.onComplete?.(fullContent);
      },
      onError: (error) => {
        console.error("Error streaming response:", error);
        const errorMessage =
          "Sorry, there was an error generating a response. Please try again.";

        // Update UI with error
        useChatStore.getState().updateAssistantMessage(errorMessage);
        useChatStore.getState().setLoading(false);
        useChatStore.getState().setStreaming(false);

        // Call the error callback if provided
        callbacks?.onError?.(errorMessage);
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);
    const errorMessage =
      "Sorry, there was an error generating a response. Please try again.";

    // Update UI with error
    useChatStore.getState().updateAssistantMessage(errorMessage);
    useChatStore.getState().setLoading(false);
    useChatStore.getState().setStreaming(false);

    // Call the error callback if provided
    callbacks?.onError?.(errorMessage);
  }
};
