import Link from "next/link";
import SignOutButton from "../navbar/SignOut";
import { Button } from "../ui/button";

export default function NavBar({
  showHome = false,
  showDashboard = false,
  showSignIn = false,
  showSignOut = false,
}: {
  showHome?: boolean;
  showDashboard?: boolean;
  showSignIn?: boolean;
  showSignOut?: boolean;
}) {
  return (
    <nav className="flex w-full shrink-0 items-center justify-between p-4">
      <div className="flex items-center gap-4">
        {showHome && (
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">Home</Link>
          </Button>
        )}
        {showDashboard && (
          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        )}
      </div>
      <div className="ml-auto flex items-center gap-4">
        {showSignIn && (
          <Button variant="outline" className="w-full" asChild>
            <Link
              href="/sign-in"
              className="w-full rounded bg-blue-500 px-4 py-2 text-center text-white transition-colors hover:bg-blue-600"
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
