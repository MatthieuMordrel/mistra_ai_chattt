"use client";

import { useNavigateToSignIn } from "@/lib/auth/navigateToSignin";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function ForbiddenPage() {
  const navigateToSignIn = useNavigateToSignIn();

  useEffect(() => {
    // Add a subtle animation effect when the page loads
    const timeout = setTimeout(() => {
      const element = document.getElementById("forbidden-message");
      if (element) element.classList.add("opacity-100");
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div
        id="forbidden-message"
        className="w-full max-w-md space-y-8 rounded-lg border border-red-200 bg-white p-8 text-center opacity-0 shadow-lg transition-opacity duration-500 dark:border-red-900 dark:bg-gray-800"
      >
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-500" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Access Forbidden
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-300">
          You don't have permission to access this resource.
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Your email address may not be on the whitelist, or your session may
          have expired.
        </p>

        <div className="pt-4">
          <button
            onClick={navigateToSignIn}
            className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none dark:bg-red-700 dark:hover:bg-red-600"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
