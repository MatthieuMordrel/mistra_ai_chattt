"use client";
import { Button } from "@/components/ui/button";
import { useChatActions } from "@/store/chatStore";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const { resetForNewConversation } = useChatActions();

  const handleNewChat = () => {
    resetForNewConversation();
    router.push("/dashboard/chat");
  };
  return (
    <Button
      onClick={handleNewChat}
      className="bg-foreground text-background hover:bg-opacity-90 rounded-full px-4 py-2 transition-colors"
    >
      {children}
    </Button>
  );
}
