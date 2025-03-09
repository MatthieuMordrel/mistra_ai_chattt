"use client";

import { useAuthSession } from "@/lib/use-auth-session";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const router = useRouter();
  const { session, loading, signOut } = useAuthSession();
  console.log(session);

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
        {!session && !loading && (
          <Link
            href="/sign-in"
            className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            Sign In
          </Link>
        )}
        {session && (
          <button
            onClick={handleSignOut}
            className="rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
          >
            Sign Out
          </button>
        )}
      </div>
    </nav>
  );
}
