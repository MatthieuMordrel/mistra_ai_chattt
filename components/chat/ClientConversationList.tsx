"use client";

import { useConversations } from "@/hooks/useConversations";
import { Conversation } from "@/lib/fetchClient/fetchConversations";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ConversationSidebar } from "./ConversationSidebar";
import { ConversationSidebarSkeleton } from "./ConversationSidebarSkeleton";

export function ClientConversationList({
  conversations,
}: {
  conversations: Conversation[];
}) {
  // Use a separate state for client-side loading
  const [isClientLoading, setIsClientLoading] = useState(true);
  const {
    conversations: conversationClient,
    isLoading,
    isError,
  } = useConversations();
  const queryClient = useQueryClient();

  // Update client loading state after hydration
  useEffect(() => {
    setIsClientLoading(isLoading);
  }, [isLoading]);

  // if conversations are provided, populate the client cache with them
  useEffect(() => {
    if (conversations) {
      queryClient.setQueryData(["conversations"], conversations);
    }
  }, [conversations, queryClient]);

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
  return <ConversationSidebar conversations={conversationClient} />;
}
