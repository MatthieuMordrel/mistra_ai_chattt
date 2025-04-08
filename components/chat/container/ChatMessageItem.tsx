import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/types";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { lucario } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

const ChatMessageItem = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        //Cannot use the below because it happens when component is remounted and create a flicker on soft navigation when creating conversation
        // animate-in fade-in slide-in-from-bottom-4 duration-300
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
      )}
      data-slot="message-wrapper"
    >
      <div
        className={cn(
          "markdown-content max-w-[85%] px-4 pt-3",
          isUser
            ? "bg-primary rounded-2xl !text-white shadow-sm"
            : "text-foreground",
        )}
        data-slot="message-bubble"
      >
        <div className="max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const inlineCode = !match;
                return !inlineCode ? (
                  <SyntaxHighlighter
                    language={match[1]}
                    style={lucario}
                    PreTag="div"
                    customStyle={{
                      borderRadius: "0.375rem",
                      margin: "1rem 0",
                    }}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
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
