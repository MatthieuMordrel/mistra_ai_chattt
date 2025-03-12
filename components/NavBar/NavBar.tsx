import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "../ui/button";
import SignOutButton from "./SignOut";

export default async function NavBar() {
  //this makes the pages dynamic
  const session = await auth.api.getSession({ headers: await headers() });

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
              <Suspense fallback={<div> </div>}>
                <SignOutButton />
              </Suspense>
            )}
          </>
        </div>
      </div>
    </nav>
  );
}
