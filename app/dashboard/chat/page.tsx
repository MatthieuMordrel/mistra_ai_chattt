import ChatContainer from "@/components/chat/ChatContainer";

/**
 * Chat page component for new conversations
 * Uses the ChatContainer component for the UI
 */
export default function ChatPage() {
  return (
    <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-4xl flex-col p-4">
      <ChatContainer />
    </div>
  );
}
