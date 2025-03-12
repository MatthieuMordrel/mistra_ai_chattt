import { ConversationWithMessages } from "@/types/db";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatMessageList from "./ChatMessageList";

/**
 * Container component for the chat interface
 * Orchestrates the chat UI components and hooks
 */
export default function ChatContainer({
  conversation,
}: {
  conversation?: ConversationWithMessages;
}) {
  return (
    <div className="flex h-full flex-col">
      <ChatHeader title={conversation?.title} />
      <div className="relative flex-1 overflow-hidden">
        <ChatMessageList messages={conversation?.messages} />
      </div>
      <ChatInput />
    </div>
  );
}
