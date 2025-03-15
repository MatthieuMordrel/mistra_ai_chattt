import { ModelService } from "@/db/services/model-service";
import { ConversationWithMessages } from "@/types/db";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatMessageList from "./ChatMessageList";

/**
 * Container component for the chat interface
 * Orchestrates the chat UI components and hooks
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
  const models = await ModelService.getActiveModels();
  console.log(models);

  return (
    <div className="flex h-full flex-col">
      <ChatHeader titleServer={conversation?.title} modelsServer={models} />
      <div className="relative flex-1 overflow-hidden">
        <ChatMessageList messages={messages} />
      </div>
      <ChatInput conversationIdServer={conversation?.id} />
    </div>
  );
}
