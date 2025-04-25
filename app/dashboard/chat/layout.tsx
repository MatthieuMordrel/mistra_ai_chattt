import { ChatPageHeader } from "@/components/chat/header/ChatPageHeader";

type Props = {
  children: React.ReactNode;
  params: Promise<{ conversationId: string }>;
};

/**
 * Layout component for chat routes
 * This layout is nested inside the dashboard layout
 * It includes the ChatPageHeader which contains the conversation title and model selector
 * This ensures the ModelSelector is shared across all chat routes
 */
export default async function ChatLayout({ children, params }: Props) {
  return (
    <div className="mx-auto flex h-[calc(100vh-6rem)] flex-col p-4">
      <ChatPageHeader />
      <div className="flex h-full flex-col">{children}</div>
    </div>
  );
}
