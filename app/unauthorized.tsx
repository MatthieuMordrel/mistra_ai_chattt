"use client";

import { useNavigateToSignIn } from "@/lib/auth/navigateToSignin";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function UnauthorizedPage() {
  const navigateToSignIn = useNavigateToSignIn();

  useEffect(() => {
    // Add a subtle animation effect when the page loads
    const timeout = setTimeout(() => {
      const element = document.getElementById("unauthorized-message");
      if (element) element.classList.add("opacity-100");
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div
        id="unauthorized-message"
        className="w-full max-w-md space-y-8 rounded-lg border border-amber-200 bg-white p-8 text-center opacity-0 shadow-lg transition-opacity duration-500 dark:border-amber-900 dark:bg-gray-800"
      >
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <AlertTriangle className="h-12 w-12 text-amber-600 dark:text-amber-500" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Unauthorized Access
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-300">
          You need to sign in to access this resource.
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Your session may have expired or you haven't authenticated yet.
        </p>

        <div className="pt-4">
          <button
            onClick={navigateToSignIn}
            className="inline-flex items-center justify-center rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:outline-none dark:bg-amber-700 dark:hover:bg-amber-600"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
