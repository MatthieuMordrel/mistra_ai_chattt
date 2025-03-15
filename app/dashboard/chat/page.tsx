import ChatContainer from "@/components/chat/ChatContainer";
import SkeletonChat from "@/components/chat/SkeletonChat";
import { Suspense } from "react";
/**
 * Chat page component for new conversations
 * Uses the ChatContainer component for the UI
 */
export default function ChatPage() {
  return (
    <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-4xl flex-col p-4">
      <Suspense fallback={<SkeletonChat />}>
        <ChatContainer />
      </Suspense>
    </div>
  );
}
