"use client";

import { MessageSquareIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
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
  // Track hydration state
  const [isHydrated, setIsHydrated] = useState(false);

  // Ensure conversations is always an array to prevent hydration mismatches
  const conversationList = Array.isArray(conversations) ? conversations : [];

  // After hydration is complete, update the state
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="px-4 py-3">
        <h2 className="text-lg font-semibold">Conversations</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {/* 
            During the first render, always show the empty state to match server rendering
            After hydration, render based on the actual data
          */}
          {!isHydrated || conversationList.length === 0 ? (
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

              return (
                <Link
                  key={conversation.id}
                  href={`/dashboard/chat/${conversation.id}`}
                  className="w-full"
                  prefetch={true}
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
        <Link href="/dashboard/chat" className="w-full">
          <Button className="w-full">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Conversation
          </Button>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
