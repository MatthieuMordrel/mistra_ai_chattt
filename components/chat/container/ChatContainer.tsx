import SkeletonChat from "@/components/skeletons/SkeletonChat";
import { Suspense } from "react";
import ChatMessageList from "./ChatMessageList";
/**
 * Container component for the chat interface
 * Orchestrates the chat UI components and hooks
 * Uses ServerConversationLoader to hydrate the chat store with conversation data
 * The ChatPageHeader with conversation title and model selector is now in the chat layout
 * This ensures the ModelSelector is truly shared across all chat routes
 */
export default function ChatContainer() {
  return (
    <div className="flex h-full flex-col gap-2">
      {/* Load conversation data into the store */}
      {/* <ConversationProvider conversation={conversation} /> */}
      {/* <ChatTitle conversationTitleServer={conversation?.title} /> */}

      {/* Chat message container */}
      <Suspense fallback={<SkeletonChat />}>
        <ChatMessageList />
      </Suspense>

      {/* Chat input for sending messages */}
      {/* <ChatInput /> */}
    </div>
  );
}
