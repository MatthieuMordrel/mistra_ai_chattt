import { ConversationWithMessages } from "@/types/db";
import { ConversationProvider } from "../providers/ConversationProvider";
import ChatInput from "./ChatInput";
import ChatMessageContainer from "./ChatMessagecontainer";
import ChatTitle from "./ChatTitle";
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
    <div className="gap flex h-full flex-col">
      {/* Load conversation data into the store */}
      <ConversationProvider conversation={conversation} />
      <ChatTitle conversationTitleServer={conversation?.title} />

      {/* Chat message container */}
      <ChatMessageContainer />

      {/* Chat input for sending messages */}
      <ChatInput />
    </div>
  );
}
