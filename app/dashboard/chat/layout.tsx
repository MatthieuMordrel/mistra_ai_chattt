import { ChatPageHeader } from "@/components/chat/ChatPageHeader";

/**
 * Layout component for chat routes
 * This layout is nested inside the dashboard layout
 * It includes the ChatPageHeader which contains the conversation title and model selector
 * This ensures the ModelSelector is shared across all chat routes
 */
export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-4xl flex-col p-4">
      {/* Chat page header with conversation title and model selector */}
      {/* This is shared across all chat routes */}
      <ChatPageHeader />

      {/* Chat route content */}
      {children}
    </div>
  );
}
