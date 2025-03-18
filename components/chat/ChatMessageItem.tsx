import { ChatMessage } from "@/types/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Component for rendering a single chat message
 * Handles different styling based on message role and streaming state
 * Uses React Markdown to render message content with markdown formatting
 */
const ChatMessageItem = ({ message }: { message: ChatMessage }) => {
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
        <div className="markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
        {message.isStreaming && (
          <div className="mt-1 h-4 w-5 animate-pulse rounded-full bg-current opacity-40"></div>
        )}
      </div>
    </div>
  );
};

export default ChatMessageItem;
