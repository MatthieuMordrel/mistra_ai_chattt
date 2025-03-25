import NavBar from "@/components/navbar/NavBar";
import SignIn from "@/components/sign-in";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar showHome={true} />
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <div className="mb-2 text-center">
          <p className="text-lg font-medium">
            You must be whitelisted to access the website!
          </p>
          <p className="text-muted-foreground text-sm">
            Please send a mail to matthieumordrel@gmail.com if needed
          </p>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
