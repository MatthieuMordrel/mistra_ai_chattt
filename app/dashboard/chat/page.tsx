import ChatContainer from "@/components/chat/ChatContainer";
/**
 * Chat page component for new conversations
 * Uses the ChatContainer component for the UI
 */
export default function ChatPage() {
  return (
    <div className="flex h-full flex-col">
      <ChatContainer />
    </div>
  );
}
