import Link from "next/link";
import SignOutButton from "../navbar/SignOut";
import { Button } from "../ui/button";

export default function NavBar({ signIn }: { signIn: boolean }) {
  return (
    <nav className="flex w-full shrink-0 items-center justify-between p-4">
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
            {signIn ? (
              <Button variant="outline" className="w-full" asChild>
                <Link
                  href="/sign-in"
                  className="w-full rounded bg-blue-500 px-4 py-2 text-center text-white transition-colors hover:bg-blue-600"
                >
                  Sign In
                </Link>
              </Button>
            ) : (
              <SignOutButton />
            )}
          </>
        </div>
      </div>
    </nav>
  );
}
