"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleSignOut}>
      Sign Out
    </Button>
  );
}
