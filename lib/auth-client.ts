import { createAuthClient } from "better-auth/client";

// Base URL for the application
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";

const authClient = createAuthClient({
    baseURL: baseUrl,
    // sessionEndpoint: "/api/auth/use-session"
});

export const {
    signIn,
    signOut,
    signUp,
    useSession
} = authClient;