"use client";

import { signOut, useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export default function NavBar() {
  const router = useRouter();

  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" className="w-full" asChild>
          <Link href="/">Home</Link>
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-24 items-center justify-center">
          {!isPending && (
            <>
              {!session && (
                <Button variant="outline" className="w-full" asChild>
                  <Link
                    href="/sign-in"
                    className="w-full rounded bg-blue-500 px-4 py-2 text-center text-white transition-colors hover:bg-blue-600"
                  >
                    Sign In
                  </Link>
                </Button>
              )}
              {session && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
