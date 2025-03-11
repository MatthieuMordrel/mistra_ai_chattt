"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MistralMessage, streamMistralClient } from "@/lib/mistral-client";
import { ChatMessage } from "@/types/types";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Chat page component
 */
export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Handle sending a message
   */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    // Add user message to chat
    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    // Add placeholder for assistant message
    const assistantMessageIndex = messages.length + 1;
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", isStreaming: true },
    ]);

    setInput("");
    setIsLoading(true);

    try {
      // Convert chat messages to Mistral API format
      const mistralMessages: MistralMessage[] = messages
        .concat(userMessage)
        .map(({ role, content }) => {
          if (role === "user") {
            return {
              role: "user" as const,
              content,
            };
          } else if (role === "assistant") {
            return {
              role: "assistant" as const,
              content,
              prefix: false,
            };
          } else {
            return {
              role: "system" as const,
              content,
            };
          }
        });

      // Stream the response using our protected API client
      await streamMistralClient({
        messages: mistralMessages,
        onToken: (token) => {
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
        onComplete: () => {
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
        onError: (error) => {
          console.error("Error streaming response:", error);
          setMessages((prev) => {
            const updated = [...prev];
            if (updated[assistantMessageIndex]) {
              updated[assistantMessageIndex] = {
                role: "assistant",
                content:
                  "Sorry, there was an error generating a response. Please try again.",
                isStreaming: false,
              };
            }
            return updated;
          });
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-4xl flex-col p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">New Conversation</h1>
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className=""
        >
          Back to Dashboard
        </Button>
      </div>

      {/* Chat messages */}
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
              <div
                key={index}
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
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat input */}
      <div className="mt-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
