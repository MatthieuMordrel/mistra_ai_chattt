import { MessagesLoader } from "@/components/chat/container/ChatLoader";
import { ChatPageHeader } from "@/components/chat/header/ChatPageHeader";

/**
 * Layout component for chat routes
 * This layout is nested inside the dashboard layout
 * It includes the ChatPageHeader which contains the conversation title and model selector
 * This ensures the ModelSelector is shared across all chat routes
 */
export default async function ChatLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string | undefined }>;
}) {
  const { id: conversationId } = await params;

  return (
    <div className="mx-auto flex h-[calc(100vh-6rem)] flex-col p-4">
      <ChatPageHeader />
      <div className="flex h-full flex-col">
        <MessagesLoader conversationId={conversationId} />
        {children}
      </div>
    </div>
  );
}
