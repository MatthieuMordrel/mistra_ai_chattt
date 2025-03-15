import { ConversationWithMessages } from "@/types/db";
import { ServerConversationLoader } from "../providers/ServerConversationLoader";
import ChatInput from "./ChatInput";
import ChatMessageList from "./ChatMessageList";

/**
 * Container component for the chat interface
 * Orchestrates the chat UI components and hooks
 * Uses ServerConversationLoader to hydrate the chat store with conversation data
 * The ChatPageHeader with conversation title and model selector is now in the chat layout
 * This ensures the ModelSelector is truly shared across all chat routes
 */
export default async function ChatContainer({
  conversation,
}: {
  conversation?: ConversationWithMessages;
}) {
  // Convert the messages to ChatMessage type for the ChatMessageList
  const messages = conversation?.messages.map((message) => ({
    role: message.role as "user" | "assistant" | "system",
    content: message.content,
    isStreaming: message.isStreaming,
  }));

  return (
    <div className="flex h-full flex-col">
      {/* Load conversation data into the store */}
      <ServerConversationLoader conversation={conversation} />

      <div className="relative flex-1 overflow-hidden">
        <ChatMessageList messages={messages} />
      </div>

      {/* Chat input for sending messages */}
      <ChatInput />
    </div>
  );
}
