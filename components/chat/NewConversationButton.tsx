"use client";
import { useChatActions } from "@/store/chatStore";
import Link from "next/link";
import { Button } from "../ui/button";

/**
 * Button component for creating a new conversation
 * Resets the chat store and navigates to the chat page
 * Takes a children prop to display the button text & icon
 */
export default function NewConversation({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setConversationTitle } = useChatActions();
  return (
    <Button
      className="bg-foreground text-background hover:bg-opacity-90 rounded-full px-4 py-2 transition-colors"
      asChild
    >
      <Link
        href="/dashboard/chat"
        prefetch={true}
        onClick={() => {
          setConversationTitle("New Chat");
        }}
      >
        {children}
      </Link>
    </Button>
  );
}
