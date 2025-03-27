"use client";

import { useEffect, useRef } from "react";

/**
 * Custom hook for auto-scrolling to the bottom of the chat
 * Returns a ref to attach to the bottom element
 * Only scrolls on initial load
 */
export function useAutoScroll() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // This is to ensure the scroll only happens once everytime the component is mounted (on each page load)
  const hasScrolledRef = useRef(false);

  // Scroll to bottom only on initial load
  useEffect(() => {
    if (hasScrolledRef.current) return;

    // Use requestAnimationFrame to ensure DOM has updated before scrolling
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        //Could be change to instant if there are many messages (would need to block rendering until scroll is complete)
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        hasScrolledRef.current = true;
      }
    };

    // Use setTimeout to ensure the scroll happens after any rendering
    const timeoutId = setTimeout(() => {
      // This is to ensure the scroll happens after any rendering
      requestAnimationFrame(scrollToBottom);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []); // Empty dependency array means this only runs once on mount

  return messagesEndRef;
}
