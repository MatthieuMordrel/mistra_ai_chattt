import NavBar from "@/components/navbar/NavBar";
import SignIn from "@/components/sign-in";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar showHome={true} />
      <div className="flex flex-1 items-center justify-center">
        <SignIn />
      </div>
    </div>
  );
}
