import { Button } from "@/components/ui/button";

/**
 * Props for the ChatHeader component
 */
interface ChatHeaderProps {
  /** Callback function when the back button is clicked */
  onBackClick: () => void;
}

/**
 * Header component for the chat interface
 * Displays the title and back button
 */
const ChatHeader = ({ onBackClick }: ChatHeaderProps) => {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold">New Conversation</h1>
      <Button variant="ghost" onClick={onBackClick} className="">
        Back to Dashboard
      </Button>
    </div>
  );
};

export default ChatHeader;
