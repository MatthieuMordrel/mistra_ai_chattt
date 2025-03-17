"use client";

import { useConversations } from "@/hooks/useConversations";
import { ConversationSidebar } from "./ConversationSidebar";

export function ClientConversationList() {
  // Use the hook to get conversations
  const { conversations, isError } = useConversations();

  // Show error state
  if (isError) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-red-500">
        Error loading conversations
      </div>
    );
  }

  // Always pass an empty array during loading to match server-side behavior
  // This ensures consistent rendering between server and client
  return <ConversationSidebar conversations={conversations || []} />;
}
