import { ChatMessage } from "@/types/types";

/**
 * Props for the ChatMessageItem component
 */
interface ChatMessageItemProps {
  /** The chat message to display */
  message: ChatMessage;
}

/**
 * Component for rendering a single chat message
 * Handles different styling based on message role and streaming state
 */
const ChatMessageItem = ({ message }: ChatMessageItemProps) => {
  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-3xl rounded-lg px-4 py-2 ${
          message.role === "user"
            ? "bg-blue-500 text-white"
            : "bg-gray-100 dark:bg-gray-700"
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        {message.isStreaming && (
          <div className="mt-1 h-4 w-5 animate-pulse rounded-full bg-current opacity-40"></div>
        )}
      </div>
    </div>
  );
};

export default ChatMessageItem;
