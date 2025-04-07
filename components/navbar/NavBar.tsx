"use client";

import { Home } from "lucide-react";
import Link from "next/link";
import SignOutButton from "../navbar/SignOut";
import { Button } from "../ui/button";
import { SidebarTrigger } from "../ui/sidebar";

export default function NavBar({
  showHome = false,
  showDashboard = false,
  showSignIn = false,
  showSignOut = false,
  showSidebarTrigger = false,
}: {
  showHome?: boolean;
  showDashboard?: boolean;
  showSignIn?: boolean;
  showSignOut?: boolean;
  showSidebarTrigger?: boolean;
}) {
  return (
    <nav className="flex w-full shrink-0 items-center justify-between p-4">
      {showSidebarTrigger && <SidebarTrigger />}
      <div className="flex items-center gap-2">
        {showHome && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            asChild
          >
            <Link href="/" prefetch={null} aria-label="Home">
              {/* route is static so prefetch by default */}
              <Home className="h-4 w-4" />
            </Link>
          </Button>
        )}
        {showDashboard && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            asChild
          >
            <Link
              href="/dashboard/home"
              prefetch={true}
              aria-label="Dashboard"
              // route is dynamic because it's using the sidebar so we need to set prefetch true to not load the skeleton
            >
              <Home className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
      <div className="ml-auto flex items-center gap-2">
        {showSignIn && (
          <Button
            variant="ghost"
            className="rounded-full px-4 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
            asChild
          >
            <Link
              href="/sign-in"
              prefetch={null}
              //Route is static so prefetch by default
            >
              Sign In
            </Link>
          </Button>
        )}
        {showSignOut && <SignOutButton />}
      </div>
    </nav>
  );
}
