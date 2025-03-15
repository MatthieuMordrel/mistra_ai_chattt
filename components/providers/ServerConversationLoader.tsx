import { ConversationWithMessages } from "@/types/db";
import { ChatMessage } from "@/types/types";
import { ConversationProvider } from "./ConversationProvider";

/**
 * Server component that fetches conversation data and passes it to the client ConversationProvider
 * This follows the same pattern as ServerModelsLoader
 * Used in the ChatContainer to hydrate the chat store with conversation-specific data
 * The conversation title will be used by the ChatPageHeader in the chat layout
 */
export function ServerConversationLoader({
  conversation,
}: {
  conversation?: ConversationWithMessages;
}) {
  // Convert DB messages to ChatMessage type
  const messages = conversation?.messages.map((message) => ({
    role: message.role as "user" | "assistant" | "system",
    content: message.content,
    isStreaming: message.isStreaming,
  })) as ChatMessage[] | undefined;

  return (
    <ConversationProvider
      conversationId={conversation?.id}
      conversationTitle={conversation?.title}
      messages={messages}
    />
  );
}
