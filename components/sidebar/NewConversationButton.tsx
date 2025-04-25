"use client";
import { useTokenActions } from "@/store/chatStore";
import { useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const { resetTokenCount } = useTokenActions();
  const resetNewConversation = () => {
    queryClient.setQueryData(["conversation", null], []);
    resetTokenCount();
  };
  return (
    <Button
      className="bg-foreground text-background hover:bg-opacity-90 rounded-full px-4 py-2 transition-colors"
      asChild
    >
      <Link
        href="/dashboard/chat"
        prefetch={true}
        onNavigate={resetNewConversation}
      >
        {children}
      </Link>
    </Button>
  );
}
