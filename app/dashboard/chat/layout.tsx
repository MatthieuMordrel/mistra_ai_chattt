import { MessagesLoader } from "@/components/chat/container/ChatLoader";
import { ChatPageHeader } from "@/components/chat/header/ChatPageHeader";
import { headers } from "next/headers";

/**
 * Layout component for chat routes
 * This layout is nested inside the dashboard layout
 * It includes the ChatPageHeader which contains the conversation title and model selector
 * This ensures the ModelSelector is shared across all chat routes
 */
export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("referer");
  const conversationId = pathname?.split("/").pop();

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
