import { signOut } from "@/lib/auth/config/auth-client";
import { tryCatch } from "@/lib/tryCatch";
import { useRouter } from "next/navigation";

/**
 * Custom hook to navigate the user to the sign-in page.
 * Always redirects to /sign-in, even if signOut fails (e.g., no session cookie).
 */
export const useNavigateToSignIn = () => {
  const router = useRouter();

  const navigateToSignIn = async () => {
    //This works as long as the user didn't update the session cookie
    //If the user updated the session cookie, he will be stuck on unauthorized page
    await tryCatch(signOut());
    router.push("/sign-in");
  };

  return navigateToSignIn;
};
