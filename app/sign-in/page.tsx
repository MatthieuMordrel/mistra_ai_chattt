import DevDashboardButton from "@/components/dev/DevDashboardButton";
import NavBar from "@/components/navbar/NavBar";
import SignIn from "@/components/sign-in";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar showHome={true} />
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <div className="mb-2 text-center">
          <p className="text-lg font-medium">Sign in to start chatting!</p>
          <p className="text-muted-foreground text-sm">
            Free users are limited to 100 messages
          </p>
        </div>
        <SignIn />
        <DevDashboardButton />
      </div>
    </div>
  );
}
