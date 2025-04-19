import { useChatStoreBase } from "@/store/chatStore";
import { ChatMessage } from "@/types/types";

/**
 * Options for sending a message
 */
export interface SendMessageOptions {
  currentMessages: ChatMessage[];
  userMessage: ChatMessage;
  conversationId: string;
  callbacks?: {
    onComplete?: (fullContent: string) => void;
    onError?: (errorMessage: string) => void;
  };
}

/**
 * Send a message to the Mistral AI API and handle streaming response
 * This function is kept for backward compatibility
 * It delegates to the store's streamAssistantMessage function
 *
 * @param options - The options for sending a message
 * @returns A promise that resolves when the message is sent and the response is processed
 */
export const streamAssistantMessageAndSaveToDb = async ({
  currentMessages,
  conversationId,
  callbacks,
}: SendMessageOptions): Promise<void> => {
  await useChatStoreBase.getState().actions.streamAssistantMessage({
    currentMessages,
    conversationId,
    callbacks,
  });
};
