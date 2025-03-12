"use client";

import {
  createConversationAction,
  saveMessagesAction,
} from "@/app/actions/conversation-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { streamAssistantMessageAndSaveToDb } from "@/services/chatService";
import { useChatStore } from "@/store/chatStore";
import { ChatMessage } from "@/types/types";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Component for the chat input form
 * Handles user input and message submission
 */
const ChatInput = () => {
  const messages = useChatStore((state) => state.messages);
  const conversationId = useChatStore((state) => state.conversationId);
  const isLoading = useChatStore((state) => state.isLoading);
  const setConversationId = useChatStore((state) => state.setConversationId);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
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

    // Create user message object
    const userMessage: ChatMessage = {
      role: "user",
      content: input,
    };

    // Clear input field immediately for better UX
    setInput("");

    // Handle first message - create conversation in DB
    if (messages.length === 0) {
      try {
        //Create the conversation in the DB
        const result = await createConversationAction(input);

        // Navigate to the conversation page
        router.push(`/dashboard/chat/${result.id}`);
        // Save the user message to the database
        await saveMessagesAction(result.id, [userMessage]);

        // Update the conversation ID in the store
        setConversationId(result.id);

        // Send message to the API using the chat service
        await streamAssistantMessageAndSaveToDb({
          currentMessages: messages,
          userMessage,
          conversationId: result.id,
        });
      } catch (error) {
        console.error("Error creating conversation:", error);
      }
    } else {
      // For existing conversations, just save the message and send it
      if (conversationId) {
        try {
          await saveMessagesAction(conversationId, [userMessage]);
        } catch (error) {
          console.error("Error saving user message:", error);
          // Continue even if saving fails - the UI will still show the message
        }
      }
      // Send message to the API using the chat service
      await streamAssistantMessageAndSaveToDb({
        currentMessages: messages,
        userMessage,
        conversationId,
      });
    }
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
