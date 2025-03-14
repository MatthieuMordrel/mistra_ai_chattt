"use client";

import { MessageSquareIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useChatStore } from "@/store/chatStore";
interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
}

export function ConversationSidebar({
  conversations,
}: ConversationSidebarProps) {
  const pathname = usePathname();
  const setMessages = useChatStore((state) => state.setMessages);

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="px-4 py-3">
        <h2 className="text-lg font-semibold">Conversations</h2>
      </SidebarHeader>
      <SidebarContent>
        {conversations.length === 0 ? (
          <div className="text-muted-foreground flex h-40 flex-col items-center justify-center px-4 text-center">
            <MessageSquareIcon className="mb-2 h-8 w-8 opacity-50" />
            <p>No conversations yet</p>
            <p className="text-sm">
              Start a new conversation to begin chatting
            </p>
          </div>
        ) : (
          <SidebarMenu>
            {conversations.map((conversation) => {
              const isActive =
                pathname === `/dashboard/chat/${conversation.id}`;

              return (
                <Link
                  key={conversation.id}
                  href={`/dashboard/chat/${conversation.id}`}
                  className="w-full"
                  prefetch={true}
                >
                  <SidebarMenuButton
                    isActive={isActive}
                    className="w-full justify-start"
                  >
                    {conversation.title}
                  </SidebarMenuButton>
                </Link>
              );
            })}
          </SidebarMenu>
        )}
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Link href="/dashboard/chat" className="w-full">
          <Button
            onClick={() => {
              setMessages([]);
            }}
            className="w-full"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            New Conversation
          </Button>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
