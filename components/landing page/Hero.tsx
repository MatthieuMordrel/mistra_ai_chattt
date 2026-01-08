import DevDashboardButton from "@/components/dev/DevDashboardButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * Hero component for the landing page
 * Displays the main heading, description, and primary action buttons
 */
const Hero = () => {
  return (
    <div className="container mx-auto flex max-w-5xl flex-col items-center justify-center gap-8 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Chat with{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Mistral AI
          </span>
        </h1>
        <p className="text-muted-foreground mx-auto max-w-xl md:text-lg">
          A simple and powerful chat application that allows you to interact
          with different Mistral language models.
        </p>
      </div>

      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <Button size="lg" asChild>
          <Link href="/sign-in">Get Started</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <a
            href="https://github.com/MatthieuMordrel/mistra_ai_chattt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <svg
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
            </svg>
            GitHub
          </a>
        </Button>
        <DevDashboardButton />
      </div>
    </div>
  );
};

export default Hero;
