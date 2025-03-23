"use client";

import TokenCounter from "@/components/chat/TokenCounter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatInput } from "@/hooks/useChatInput";
import { SendIcon } from "lucide-react";

/**
 * Component for the chat input form
 * Handles user input and message submission
 * UI layer that uses the useChatInput hook for logic
 */
const ChatInput = () => {
  // Use the custom hook to separate logic from UI
  const { input, setInput, inputRef, isLoading, handleSubmit } = useChatInput();

  return (
    <div className="mt-4 px-2 sm:px-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="border-input bg-background focus-visible:ring-primary w-full rounded-full border px-6 py-6 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none dark:bg-gray-800"
            disabled={isLoading}
          />

          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 absolute right-2 flex h-10 w-10 items-center justify-center rounded-full p-2 shadow-md transition-all disabled:opacity-50"
            aria-label="Send message"
          >
            <SendIcon className="h-5 w-5" />
          </Button>
        </div>
      </form>

      {/* Token counter display */}
      <div className="mt-2 flex justify-end">
        <TokenCounter />
      </div>
    </div>
  );
};

export default ChatInput;
