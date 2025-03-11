import { useChatStore } from "@/store/chatStore";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

/**
 * Props for the ChatHeader component
 */
interface ChatHeaderProps {
  /** Title of the conversation */
  conversationTitle: string;
  /** Callback for when the title is updated */
  onUpdateTitle?: (title: string) => void;
}

/**
 * Header component for the chat interface
 * Displays the conversation title and provides a button to clear the conversation
 */
const ChatHeader = ({ conversationTitle, onUpdateTitle }: ChatHeaderProps) => {
  const clearConversation = useChatStore((state) => state.clearConversation);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(conversationTitle);

  // Update local state when prop changes
  if (conversationTitle !== editedTitle && !isEditing) {
    setEditedTitle(conversationTitle);
  }

  const handleStartEditing = () => {
    setIsEditing(true);
    setEditedTitle(conversationTitle);
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim() && onUpdateTitle) {
      onUpdateTitle(editedTitle);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveTitle();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditedTitle(conversationTitle);
    }
  };

  return (
    <div className="mb-4 flex items-center justify-between border-b pb-2">
      {isEditing ? (
        <Input
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onBlur={handleSaveTitle}
          onKeyDown={handleKeyDown}
          className="text-xl font-bold"
          autoFocus
        />
      ) : (
        <h1
          className="cursor-pointer text-xl font-bold hover:text-blue-500"
          onClick={handleStartEditing}
          title="Click to edit title"
        >
          {conversationTitle}
        </h1>
      )}
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
