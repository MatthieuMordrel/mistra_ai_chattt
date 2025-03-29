import { signOut } from "@/lib/auth/config/auth-client";
import { useRouter } from "next/navigation";

export const useNavigateToSignIn = () => {
  const router = useRouter();

  const navigateToSignIn = async () => {
    // Clear the session token cookie
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
        },
        onError: (error) => {
          console.error("Error signing out:", error);
        },
      },
    });
  };

  return navigateToSignIn;
};
