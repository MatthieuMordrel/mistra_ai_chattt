"use client";

import { signOut, useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
        <Link href="/">Home</Link>
        <Link href="/dashboard">Dashboard</Link>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-24 items-center justify-center">
          {!isPending && (
            <>
              {!session && (
                <Link
                  href="/sign-in"
                  className="w-full rounded bg-blue-500 px-4 py-2 text-center text-white transition-colors hover:bg-blue-600"
                >
                  Sign In
                </Link>
              )}
              {session && (
                <button
                  onClick={handleSignOut}
                  className="w-full rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
                >
                  Sign Out
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
