"use client";

import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import ChatMessageList from "@/components/chat/ChatMessageList";
import { useChat } from "@/hooks/useChat";
import { useRouter } from "next/navigation";

/**
 * Chat page component that orchestrates the chat interface
 */
export default function ChatPage() {
  const router = useRouter();
  const { messages, isLoading, messagesEndRef, sendChatMessage } = useChat();

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-4xl flex-col p-4">
      <ChatHeader onBackClick={() => router.push("/dashboard")} />

      <ChatMessageList messages={messages} messagesEndRef={messagesEndRef} />

      <ChatInput onSendMessage={sendChatMessage} isLoading={isLoading} />
    </div>
  );
}
