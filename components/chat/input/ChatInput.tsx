"use client";

import TokenCounter from "@/components/chat/input/TokenCounter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatInput } from "@/hooks/useChatInput";
import { useInputFocus } from "@/hooks/utils/useInputFocus";
import { cn } from "@/lib/utils";
import { SendIcon } from "lucide-react";
import { useRef, useState } from "react";

/**
 * Component for the chat input form
 * Handles user input and message submission
 * UI layer that uses the useChatInput hook for logic
 */
const ChatInput = () => {
  // Reference to the input element for focus management
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Use the custom hook to separate logic from UI
  const { input, setInput, isLoading, handleSubmit } = useChatInput();

  const handleFormSubmit = async (e: React.FormEvent) => {
    setError(null);
    try {
      await handleSubmit(e);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  };

  // Handle input focus behavior
  useInputFocus(inputRef, isLoading);

  return (
    <div className="mt-4 px-2 sm:px-4">
      <form onSubmit={handleFormSubmit} className="relative">
        <div className="relative flex items-center">
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            placeholder="Type your message..."
            className={cn(
              "border-input bg-background focus-visible:ring-primary w-full rounded-full border px-6 py-6 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none dark:bg-gray-800",
              error && "border-red-500",
            )}
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
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </form>

      {/* Token counter display */}
      <div className="mt-2 flex justify-end">
        <TokenCounter />
      </div>
    </div>
  );
};

export default ChatInput;
