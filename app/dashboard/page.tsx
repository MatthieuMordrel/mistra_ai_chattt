"use client";

import { useSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();

  // Redirect to sign-in if not authenticated
  if (!isPending && !session) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-4xl w-full space-y-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Mistral AI Chat
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Your intelligent AI assistant powered by Mistral models
        </p>
        
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-semibold mb-3">Start a New Chat</h2>
            <p className="mb-4">Begin a conversation with one of our AI models</p>
            <button className="px-4 py-2 bg-foreground text-background rounded-full hover:bg-opacity-90 transition-colors">
              New Conversation
            </button>
          </div>
          
          <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-semibold mb-3">View History</h2>
            <p className="mb-4">Access your previous conversations</p>
            <button className="px-4 py-2 bg-foreground text-background rounded-full hover:bg-opacity-90 transition-colors">
              Chat History
            </button>
          </div>
        </div>
        
        {session && (
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm">
              Signed in as: <span className="font-medium">{session.user?.email}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
