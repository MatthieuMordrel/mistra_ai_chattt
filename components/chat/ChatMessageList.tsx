import { ChatMessage } from "@/types/types";
import { RefObject } from "react";
import ChatMessageItem from "./ChatMessageItem";

/**
 * Props for the ChatMessageList component
 */
interface ChatMessageListProps {
  /** Array of chat messages to display */
  messages: ChatMessage[];
  /** Ref to scroll to the end of the messages */
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

/**
 * Component for displaying a list of chat messages
 * Handles empty state and message rendering
 */
const ChatMessageList = ({
  messages,
  messagesEndRef,
}: ChatMessageListProps) => {
  return (
    <div className="flex-1 overflow-y-auto rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center text-center">
          <div className="max-w-md space-y-2">
            <h2 className="text-2xl font-bold">Welcome to Mistral AI Chat</h2>
            <p className="text-gray-500">
              Start a conversation by typing a message below.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message, index) => (
            <ChatMessageItem key={index} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default ChatMessageList;
