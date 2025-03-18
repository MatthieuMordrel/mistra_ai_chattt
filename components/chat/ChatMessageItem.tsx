import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChatMessageItem = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "animate-in fade-in slide-in-from-bottom-4 flex w-full duration-300",
        isUser ? "justify-end" : "justify-start",
      )}
      data-slot="message-wrapper"
    >
      <div
        className={cn(
          "prose prose-sm dark:prose-invert max-w-[85%] rounded-2xl px-4 py-3 shadow-sm",
          isUser
            ? "bg-primary dark:text-primary-foreground text-white!"
            : "bg-muted text-foreground dark:bg-secondary",
          message.isStreaming && "animate-pulse",
        )}
        data-slot="message-bubble"
      >
        <div className="max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
        {message.isStreaming && (
          <div className="mt-2 flex space-x-1">
            <div className="size-2 animate-bounce rounded-full bg-current opacity-60 delay-100"></div>
            <div className="size-2 animate-bounce rounded-full bg-current opacity-60 delay-200"></div>
            <div className="size-2 animate-bounce rounded-full bg-current opacity-60 delay-300"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessageItem;
