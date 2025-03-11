import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatMessageList from "./ChatMessageList";

/**
 * Container component for the chat interface
 * Orchestrates the chat UI components and hooks
 */
export default function ChatContainer() {
  return (
    <div className="flex h-full flex-col">
      <ChatHeader />
      <div className="flex-1 overflow-hidden">
        <ChatMessageList />
      </div>
      <ChatInput />
    </div>
  );
}
