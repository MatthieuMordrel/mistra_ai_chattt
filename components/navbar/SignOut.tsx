"use client";

import { signOut } from "@/lib/auth/auth-client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Sign out"
          className="h-9 w-9 rounded-full"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="end">
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={handleSignOut}
        >
          Sign out?
        </Button>
      </PopoverContent>
    </Popover>
  );
}
