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
            <Link href="/" prefetch={null}>
              {/* route is static so prefetch by default */}
              Home
            </Link>
          </Button>
        )}
        {showDashboard && (
          <Button variant="outline" className="w-full" asChild>
            <Link
              href="/dashboard/home"
              prefetch={true} // route is dynamic because it's using the sidebar so we need to set prefetch true to not load the skeleton
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </Link>
          </Button>
        )}
      </div>
      <div className="ml-auto flex items-center gap-4">
        {showSignIn && (
          <Button variant="outline" className="w-full" asChild>
            <Link
              href="/sign-in"
              prefetch={null} //Route is static so prefetch by default
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
