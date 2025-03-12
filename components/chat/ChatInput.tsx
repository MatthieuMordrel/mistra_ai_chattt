"use client";

import {
  createConversation,
  saveMessages,
} from "@/app/actions/conversation-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { streamMistralClient } from "@/lib/mistral-client";
import { useChatStore } from "@/store/chatStore";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Component for the chat input form
 * Handles user input and message submission
 */
const ChatInput = () => {
  const messages = useChatStore((state) => state.messages);
  const addUserMessage = useChatStore((state) => state.addUserMessage);
  const setConversationId = useChatStore((state) => state.setConversationId);
  const addAssistantMessage = useChatStore(
    (state) => state.addAssistantMessage,
  );
  const updateAssistantMessage = useChatStore(
    (state) => state.updateAssistantMessage,
  );
  const setLoading = useChatStore((state) => state.setLoading);
  const setStreaming = useChatStore((state) => state.setStreaming);
  const isLoading = useChatStore((state) => state.isLoading);
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

    // Create a new messages array that includes the current user input
    const currentUserMessage = {
      role: "user" as const,
      content: input,
      isStreaming: false,
      id: "",
      createdAt: new Date(),
      conversationId: "",
      tokens: null,
    };

    //Create conversation in db if there is no messages
    if (messages.length === 0) {
      const conversationId = await createConversation(input);
      //Update conversation id in the client store
      setConversationId(conversationId.id);
      await saveMessages(conversationId.id, [
        {
          role: "user",
          content: input,
        },
      ]);
      router.push(`/dashboard/chat/${conversationId.id}`);
    }

    // Add messages to the client store (this happens asynchronously)
    addUserMessage(input);
    addAssistantMessage("", true);
    setLoading(true);
    setStreaming(true);

    // IMPORTANT: We need to create a separate array with the current messages plus the new user message
    // because React state updates (addUserMessage, addAssistantMessage) are asynchronous and won't be
    // reflected immediately in the 'messages' array from the store
    const messagesToSend = [...messages, currentUserMessage];

    console.log("Sending messages to the API", messagesToSend);

    // Initialize a variable to accumulate the streaming content
    let accumulatedContent = "";

    // Send messages to the API with streaming
    try {
      await streamMistralClient({
        messages: messagesToSend,
        onToken: (token) => {
          // Make sure streaming flag is set to true during token streaming
          if (!useChatStore.getState().isStreaming) {
            setStreaming(true);
          }

          // Accumulate the content and update the UI with each token
          accumulatedContent += token;
          updateAssistantMessage(accumulatedContent);
        },
        onComplete: (fullContent) => {
          // Final update with the complete content
          updateAssistantMessage(fullContent);
          setLoading(false);
          setStreaming(false);
        },
        onError: (error) => {
          console.error("Error streaming response:", error);
          updateAssistantMessage(
            "Sorry, there was an error generating a response. Please try again.",
          );
          setLoading(false);
          setStreaming(false);
        },
      });
    } catch (error) {
      console.error("Error in streamMistralClient:", error);
      updateAssistantMessage(
        "Sorry, there was an error generating a response. Please try again.",
      );
      setLoading(false);
      setStreaming(false);
    }

    setInput("");
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
