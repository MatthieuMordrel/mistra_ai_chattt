import { sendMessage } from "@/services/chatService";
import { ChatMessage } from "@/types/types";
import { useEffect, useRef, useState } from "react";

/**
 * Custom hook for managing chat state and logic
 */
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Send a new message in the chat
   */
  const sendChatMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    // Add user message to chat
    const userMessage: ChatMessage = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);

    // Add placeholder for assistant message
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", isStreaming: true },
    ]);

    setIsLoading(true);

    // Send message to API using our service
    await sendMessage({
      currentMessages: messages,
      userMessage,
      onTokenUpdate: (assistantMessageIndex, token) => {
        // Update the assistant message with each token
        setMessages((prev) => {
          const updated = [...prev];
          if (updated[assistantMessageIndex]) {
            updated[assistantMessageIndex] = {
              ...updated[assistantMessageIndex],
              content: updated[assistantMessageIndex].content + token,
            };
          }
          return updated;
        });
      },
      onComplete: (assistantMessageIndex) => {
        // Mark streaming as complete
        setMessages((prev) => {
          const updated = [...prev];
          if (updated[assistantMessageIndex]) {
            updated[assistantMessageIndex] = {
              ...updated[assistantMessageIndex],
              isStreaming: false,
            };
          }
          return updated;
        });
        setIsLoading(false);
      },
      onError: (assistantMessageIndex, errorMessage) => {
        setMessages((prev) => {
          const updated = [...prev];
          if (updated[assistantMessageIndex]) {
            updated[assistantMessageIndex] = {
              role: "assistant",
              content: errorMessage,
              isStreaming: false,
            };
          }
          return updated;
        });
        setIsLoading(false);
      },
    });
  };

  return {
    messages,
    isLoading,
    messagesEndRef,
    sendChatMessage,
  };
}
