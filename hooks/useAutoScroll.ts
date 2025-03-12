"use client";

import { Message } from "@/types/db";
import { useEffect, useRef } from "react";

/**
 * Custom hook for auto-scrolling to the bottom of the chat
 * Returns a ref to attach to the bottom element
 *
 * @param messages - The messages to watch for changes
 * @param dependencies - Optional additional dependencies to trigger scrolling
 */
export function useAutoScroll(messages: Message[], dependencies: any[] = []) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change or when any dependency changes
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM has updated before scrolling
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };

    // Use setTimeout to ensure the scroll happens after any rendering
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(scrollToBottom);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [messages, ...dependencies]);

  return messagesEndRef;
}
