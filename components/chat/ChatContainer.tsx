import { ConversationWithMessages } from "@/types/db";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatMessageList from "./ChatMessageList";

/**
 * Container component for the chat interface
 * Orchestrates the chat UI components and hooks
 * Models are now loaded at the layout level via the ModelsProvider
 */
export default async function ChatContainer({
  conversation,
}: {
  conversation?: ConversationWithMessages;
}) {
  //convert the messages to ChatMessage type by removing the token, conversationId, and createdAt
  const messages = conversation?.messages.map((message) => ({
    role: message.role as "user" | "assistant" | "system",
    content: message.content,
    isStreaming: message.isStreaming,
  }));

  return (
    <div className="flex h-full flex-col">
      <ChatHeader titleServer={conversation?.title} />
      <div className="relative flex-1 overflow-hidden">
        <ChatMessageList messages={messages} />
      </div>
      <ChatInput conversationIdServer={conversation?.id} />
    </div>
  );
}
