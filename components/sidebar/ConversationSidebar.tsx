"use client";

import { MessageSquareIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
import { useChatActions } from "@/store/chatStore";
import NewConversation from "../chat/NewConversationButton";
import { Conversation } from "@/types/types";

export function ConversationSidebar({
  conversationsServer,
}: {
  conversationsServer: Conversation[];
}) {
  const { conversations, isError } = useConversations();

  const { setConversationTitle } = useChatActions();
  const pathParams = useParams();

  const pathname = usePathname();
  const [hoveredConversationId, setHoveredConversationId] = useState<
    string | null
  >(null);

  // Ensure conversations is always an array to prevent hydration mismatches
  const conversationList = Array.isArray(conversations) ? conversations : [];

  // Invalidate the router cache for all conversation by calling revalidatePath in a server action
  useEffect(() => {
    revalidateConversations(pathParams.id as string);
  }, [pathParams.id]);

  // Show error state
  if (isError) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-red-500">
        Error loading conversations
      </div>
    );
  }

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="px-4 py-3">
        <h2 className="text-lg font-semibold">Conversations</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {conversationList.length === 0 ? (
            <div className="text-muted-foreground flex h-40 flex-col items-center justify-center px-4 text-center">
              <MessageSquareIcon className="mb-2 h-8 w-8 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm">
                Start a new conversation to begin chatting
              </p>
            </div>
          ) : (
            conversationList.map((conversation) => {
              const isActive =
                pathname === `/dashboard/chat/${conversation.id}`;
              const shouldPrefetch = hoveredConversationId === conversation.id;

              return (
                <Link
                  key={conversation.id}
                  href={`/dashboard/chat/${conversation.id}`}
                  className="w-full"
                  prefetch={shouldPrefetch}
                  onMouseEnter={() => setHoveredConversationId(conversation.id)}
                  onMouseLeave={() => setHoveredConversationId(null)}
                  onClick={() => {
                    setConversationTitle(conversation.title);
                  }}
                >
                  <SidebarMenuButton
                    isActive={isActive}
                    className="w-full cursor-pointer justify-start"
                  >
                    {conversation.title}
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
