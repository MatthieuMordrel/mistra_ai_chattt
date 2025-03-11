import { useChatStore } from "@/store/chatStore";
import { Button } from "../ui/button";

/**
 * Props for the ChatHeader component
 */
interface ChatHeaderProps {
  /** Title of the conversation */
  conversationTitle: string;
}

/**
 * Header component for the chat interface
 * Displays the conversation title and provides a button to clear the conversation
 */
const ChatHeader = ({ conversationTitle }: ChatHeaderProps) => {
  const clearConversation = useChatStore((state) => state.clearConversation);

  return (
    <div className="mb-4 flex items-center justify-between border-b pb-2">
      <h1 className="text-xl font-bold">{conversationTitle}</h1>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          onClick={clearConversation}
          title="Clear conversation"
        >
          Clear Chat
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
