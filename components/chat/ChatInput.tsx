"use client";

import {
  createConversationAction,
  saveMessagesAction,
} from "@/app/actions/conversation-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatConversationTitle } from "@/lib/utils";
import { streamAssistantMessageAndSaveToDb } from "@/services/chatService";
import { useChatStore } from "@/store/chatStore";
import { ChatMessage } from "@/types/types";
import { useEffect, useRef, useState } from "react";

/**
 * Component for the chat input form
 * Handles user input and message submission
 */
const ChatInput = () => {
  const messages = useChatStore((state) => state.messages);
  const setMessages = useChatStore((state) => state.setMessages);
  const conversationId = useChatStore((state) => state.conversationId);
  const isLoading = useChatStore((state) => state.isLoading);
  const setConversationId = useChatStore((state) => state.setConversationId);
  const setConversationTitle = useChatStore(
    (state) => state.setConversationTitle,
  );
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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

    /**
     * Update UI state immediately before any async operations
     * This ensures the message appears in the UI right away
     */
    const updateUIState = (newMessage: ChatMessage) => {
      if (messages.length === 0) {
        setMessages([newMessage]);
      } else {
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
      }
    };

    // Update UI immediately
    updateUIState(userMessage);

    // Handle first message - create conversation in DB
    if (messages.length === 0) {
      try {
        // Format the title using our utility function
        const formattedTitle = formatConversationTitle(input);

        // Update the title using zustand, should update the ui instantly
        setConversationTitle(formattedTitle);

        // Create the conversation in the DB
        const result = await createConversationAction(formattedTitle);

        // TO DO: Find a way to navigate to the conversation page without causing the page to relaoad or the component to rerender/unmount/remount
        // This would help to allow the user to refresh the page and still have the conversation loaded
        // navigateToConversationAction(result.id);

        // Update the conversation ID in the store
        setConversationId(result.id);

        // Save the user message to the database
        await Promise.all([
          saveMessagesAction(result.id, [userMessage]),
          streamAssistantMessageAndSaveToDb({
            currentMessages: [userMessage], // Use array with user message
            userMessage,
            conversationId: result.id,
          }),
        ]);
      } catch (error) {
        console.error("Error creating conversation:", error);
      }
    } else {
      if (conversationId) {
        try {
          await saveMessagesAction(conversationId, [userMessage]);
        } catch (error) {
          console.error("Error saving user message:", error);
          // Continue even if saving fails - the UI will still show the message
        }
      }
      if (!conversationId) {
        console.error("No conversation ID found");
        return;
      }
      // Send message to the API using the chat service
      await streamAssistantMessageAndSaveToDb({
        currentMessages: [...messages, userMessage], // Include the new user message
        userMessage,
        conversationId: conversationId,
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
