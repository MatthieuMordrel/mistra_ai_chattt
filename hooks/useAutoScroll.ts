"use client";

import { ChatMessage } from "@/types/types";
import { useEffect, useRef } from "react";

/**
 * Custom hook for auto-scrolling to the bottom of the chat
 * Returns a ref to attach to the bottom element
 */
export function useAutoScroll(messages: ChatMessage[]) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return messagesEndRef;
}
