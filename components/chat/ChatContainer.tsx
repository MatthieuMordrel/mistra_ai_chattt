"use client";

import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useChat } from "@/hooks/useChat";
import { useConversationLoader } from "@/hooks/useConversationLoader";
import { useChatStore } from "@/store/chatStore";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatMessageList from "./ChatMessageList";

interface ChatContainerProps {
  conversationId?: string;
}

/**
 * Container component for the chat interface
 * Orchestrates the chat UI components and hooks
 */
export default function ChatContainer({ conversationId }: ChatContainerProps) {
  // Get messages from the store
  const messages = useChatStore((state) => state.messages);
  const isLoading = useChatStore((state) => state.isLoading);

  // Load conversation data
  const { isLoadingConversation } = useConversationLoader(conversationId);

  // Chat message handling
  const { conversationTitle, sendChatMessage, updateConversationTitle } =
    useChat(conversationId);

  // Auto-scrolling
  const messagesEndRef = useAutoScroll(messages);

  return (
    <div className="flex h-full flex-col">
      <ChatHeader
        conversationTitle={conversationTitle}
        onUpdateTitle={updateConversationTitle}
      />
      <div className="flex-1 overflow-hidden">
        <ChatMessageList messages={messages} messagesEndRef={messagesEndRef} />
      </div>
      <ChatInput
        onSendMessage={sendChatMessage}
        isLoading={isLoading || isLoadingConversation}
      />
    </div>
  );
}
