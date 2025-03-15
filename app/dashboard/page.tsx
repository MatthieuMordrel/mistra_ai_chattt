import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl space-y-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Mistral AI Chat
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-400">
          Your intelligent AI assistant powered by Mistral models
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-1">
          <div className="rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md">
            <h2 className="mb-3 text-2xl font-semibold">Start a New Chat</h2>
            <p className="mb-4">
              Begin a conversation with one of our AI models
            </p>
            <Link href="/dashboard/chat" className="inline-block">
              <Button className="bg-foreground text-background hover:bg-opacity-90 rounded-full px-4 py-2 transition-colors">
                New Conversation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
