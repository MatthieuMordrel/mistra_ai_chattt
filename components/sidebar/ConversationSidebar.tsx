"use client";

import { revalidateConversations } from "@/actions/conversation-actions";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useConversations } from "@/hooks/tanstack-query/useConversations";
import { useGetConversationIdFromParams } from "@/hooks/useGetConversationIdFromParams";
import { MessageSquareIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LinkLoadingIndicator } from "./LinkLoadingIndicator";
import NewConversation from "./NewConversationButton";

export function ConversationSidebar() {
  const { conversations } = useConversations();
  const conversationId = useGetConversationIdFromParams();
  const pathname = usePathname();
  const [hoveredConversationId, setHoveredConversationId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (conversationId) {
      revalidateConversations(conversationId);
    }
  }, [conversationId]);

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="px-4 py-3">
        <h2 className="text-lg font-semibold">Conversations</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {conversations?.length === 0 ? (
            <div className="text-muted-foreground flex h-40 flex-col items-center justify-center px-4 text-center">
              <MessageSquareIcon className="mb-2 h-8 w-8 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm">
                Start a new conversation to begin chatting
              </p>
            </div>
          ) : (
            conversations.map((conversation) => {
              const isActive =
                pathname === `/dashboard/chat?id=${conversation.id}`;
              const shouldPrefetch = hoveredConversationId === conversation.id;

              return (
                <Link
                  key={conversation.id}
                  href={`/dashboard/chat?id=${conversation.id}`}
                  className="w-full"
                  prefetch={shouldPrefetch}
                  onMouseEnter={() => setHoveredConversationId(conversation.id)}
                  onMouseLeave={() => setHoveredConversationId(null)}
                >
                  <SidebarMenuButton
                    isActive={isActive}
                    className="w-full cursor-pointer justify-between"
                  >
                    <span>{conversation.title}</span>
                    <LinkLoadingIndicator size="sm" />
                  </SidebarMenuButton>
                </Link>
              );
            })
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <NewConversation>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Conversation
        </NewConversation>
      </SidebarFooter>
    </Sidebar>
  );
}
