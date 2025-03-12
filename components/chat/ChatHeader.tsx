"use client";
/**
 * Header component for the chat interface
 * Displays the conversation title and provides a button to clear the conversation
 */
const ChatHeader = ({ title = "New Conversation" }: { title?: string }) => {
  return (
    <div className="mb-4 flex items-center justify-between border-b pb-2">
      <h1 className="text-xl font-bold">{title}</h1>
      <div className="flex gap-2">
        {/* TO DO: Handle creating new conversations */}
        {/* <Button
          variant="ghost"
          onClick={clearConversation}
          title="Start a new conversation"
        >
          Clear Chat
        </Button> */}
      </div>
    </div>
  );
};

export default ChatHeader;
