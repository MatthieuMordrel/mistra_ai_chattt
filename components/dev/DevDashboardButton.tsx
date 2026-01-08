"use client";

import { Button } from "@/components/ui/button";
import { Code2 } from "lucide-react";
import Link from "next/link";

/**
 * A button that links directly to the dashboard, only visible in development mode.
 * Used to bypass authentication during local development.
 */
export default function DevDashboardButton() {
  // Only render in development mode
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Button
      asChild
      variant="secondary"
      className="w-full cursor-pointer gap-2 border border-dashed border-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20"
    >
      <Link href="/dashboard/home">
        <Code2 className="h-4 w-4" />
        Dev: Go to Dashboard
      </Link>
    </Button>
  );
}
