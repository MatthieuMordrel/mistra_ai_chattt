import { useRouter } from "next/navigation";

export const useNavigateToSignIn = () => {
  const router = useRouter();

  const navigateToSignIn = async () => {
    // Clear the session token cookie
    // Must be done on the server side
    await fetch("/api/clear_session_cookie", {
      method: "GET",
    });
    router.push("/sign-in");
  };

  return navigateToSignIn;
};
