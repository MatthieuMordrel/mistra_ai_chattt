import ChatContainer from "@/components/chat/ChatContainer";
import { cachedValidateServerSession } from "@/lib/auth/validateSession";
/**
 * Chat page component for new conversations
 * Uses the ChatContainer component for the UI
 */
export default async function ChatPage() {
  await cachedValidateServerSession(true);
  return (
    <div className="flex h-full flex-col">
      <ChatContainer />
    </div>
  );
}
