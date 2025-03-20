"use client";

import { MessageSquareIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useConversations } from "@/hooks/useConversations";
import { useChatActions } from "@/store/chatStore";
import { Conversation } from "@/types/types";
import { useEffect } from "react";
import NewConversation from "../chat/NewConversationButton";

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

  const router = useRouter();

  // Ensure conversations is always an array to prevent hydration mismatches
  const conversationList = Array.isArray(conversations) ? conversations : [];

  // Refresh the page when the pathname changes to invalidate the router cache and ensure the latest conversations are fetched if we renavigate fast to the same conversation
  // Ideally we would like to just invalidate the cache for the conversation without making a new server request using revalidatePath
  // revalidatePath might actually works since we only see a POST request and not a GET request, tbh how this works is beyond me
  // Potentially a better solution would be limit cache duration for dynamic routes to 2 seconds using staleTimes
  // But staleTimes seems completely bugged too and doesn't work at all for some reason
  // useEffect(() => {
  //   router.refresh();
  // }, [pathname]);

  // We can try to call revalidatePath in a server action, which according to the docs should invalidate the cache for the conversations without making a new server request
  // This works but makes a request and invalidate the cache for all conversation, while ideally i would like to invalidate the cache for the specific conversation
  //Maybe i can do it in a route handler ?
  // useEffect(() => {
  //   revalidateConversations(pathParams.id as string);
  // }, [pathParams.id]);

  useEffect(() => {
    fetch(`/api/conversations/revalidate?id=${pathParams.id}`);
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
          {conversationList.length === 0 && conversationsServer.length === 0 ? (
            <div className="text-muted-foreground flex h-40 flex-col items-center justify-center px-4 text-center">
              <MessageSquareIcon className="mb-2 h-8 w-8 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm">
                Start a new conversation to begin chatting
              </p>
            </div>
          ) : (
            (conversationList.length > 0
              ? conversationList
              : conversationsServer
            ).map((conversation) => {
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
