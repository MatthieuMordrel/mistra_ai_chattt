"use client";

import ChatContainer from "@/components/chat/ChatContainer";
import { useSyncAuthStore } from "@/store/authStore";

/**
 * Auth synchronization component
 * Isolates the auth sync effect to prevent render issues
 */
function AuthSync() {
  useSyncAuthStore();
  return null;
}

/**
 * Chat page component for new conversations
 * Uses the ChatContainer component for the UI
 */
export default function ChatPage() {
  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-4xl flex-col p-4">
      <AuthSync />
      <ChatContainer />
    </div>
  );
}
