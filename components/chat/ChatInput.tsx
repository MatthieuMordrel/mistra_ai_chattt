"use client";

import { saveMessagesAction } from "@/actions/conversation-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConversations } from "@/hooks/useConversations";
import { formatConversationTitle } from "@/lib/utils";
import { streamAssistantMessageAndSaveToDb } from "@/services/chatService";
import {
  useChatActions,
  useConversationId,
  useIsLoading,
  useMessages,
} from "@/store/chatStore";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Component for the chat input form
 * Handles user input and message submission
 * Uses atomic selectors to prevent unnecessary re-renders
 */
const ChatInput = () => {
  // State selectors - component only re-renders when these specific values change
  const messages = useMessages();
  const isLoading = useIsLoading();
  const conversationId = useConversationId();

  // Actions grouped in a single object
  const {
    addUserMessage,
    setLoading,
    setConversationId,
    setConversationTitle,
  } = useChatActions();

  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Use the conversations hook for creating conversations
  const { createConversation } = useConversations();
  const router = useRouter();

  // Focus input on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keep focus on input after loading state changes
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Refocus the input after sending
    inputRef.current?.focus();
    if (!input.trim() || isLoading) return;

    // Clear input field immediately for better UX
    setInput("");

    // Add user message to the chat store
    addUserMessage(input);

    // Set loading state
    setLoading(true);

    // Handle first message - create conversation in DB
    if (messages.length === 0) {
      try {
        // Format the title using our utility function
        const formattedTitle = formatConversationTitle(input);

        // Update the title using zustand
        setConversationTitle(formattedTitle);

        // Create the conversation in the DB using TanStack Query mutation
        const result = await createConversation({
          title: formattedTitle,
          messages: [{ role: "user", content: input }],
        });

        // Update the conversation ID in the store
        setConversationId(result.id);

        // Stream the assistant message and save to DB
        await streamAssistantMessageAndSaveToDb({
          currentMessages: [{ role: "user", content: input }],
          userMessage: { role: "user", content: input },
          conversationId: result.id,
        });
      } catch (error) {
        console.error("Error creating conversation:", error);
      }
    } else {
      if (!conversationId) {
        console.error("No conversation ID found");
        setLoading(false);
        return;
      }

      try {
        console.log("Saving user message: conversationId", conversationId);
        await saveMessagesAction(conversationId, [
          { role: "user", content: input },
        ]);
        console.log("User message saved");
      } catch (error) {
        console.error("Error saving user message:", error);
        // Continue even if saving fails - the UI will still show the message
      }

      console.log("Streaming assistant message");
      // Send message to the API using the chat service
      await streamAssistantMessageAndSaveToDb({
        currentMessages: [...messages, { role: "user", content: input }],
        userMessage: { role: "user", content: input },
        conversationId: conversationId,
      });
    }

    // Set loading state back to false when complete
    setLoading(false);
  };

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          Send
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
