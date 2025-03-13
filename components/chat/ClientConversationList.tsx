"use client";

import { useConversations } from "@/hooks/useConversations";
import { useEffect, useState } from "react";
import { ConversationSidebar } from "./ConversationSidebar";
import { ConversationSidebarSkeleton } from "./ConversationSidebarSkeleton";

export function ClientConversationList() {
  // Use a separate state for client-side loading
  const [isClientLoading, setIsClientLoading] = useState(true);
  const { conversations, isLoading, isError } = useConversations();

  // Update client loading state after hydration
  useEffect(() => {
    setIsClientLoading(isLoading);
  }, [isLoading]);

  // Always show skeleton on first render to avoid hydration mismatch
  // Then use client-side state for subsequent renders
  if (isClientLoading) {
    return <ConversationSidebarSkeleton />;
  }

  // Show error state
  if (isError) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-red-500">
        Error loading conversations
      </div>
    );
  }

  // Render the conversation sidebar with the fetched conversations
  return <ConversationSidebar conversations={conversations} />;
}
