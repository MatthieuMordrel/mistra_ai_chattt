import ChatContainer from "@/components/chat/ChatContainer";
import SkeletonChat from "@/components/skeletons/SkeletonChat";
import { Suspense } from "react";
/**
 * Chat page component for new conversations
 * Uses the ChatContainer component for the UI
 */
export default function ChatPage() {
  return (
    <div className="flex h-full flex-col">
      <Suspense fallback={<SkeletonChat />}>
        <ChatContainer />
      </Suspense>
    </div>
  );
}
