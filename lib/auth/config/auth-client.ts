import { createAuthClient } from "better-auth/react";

// Base URL for the application
const baseUrl = process.env.BETTER_AUTH_URL;

const authClient = createAuthClient({
  baseURL: baseUrl,
  sessionEndpoint: "/api/auth/use-session",
});

// Export individual methods
export const { signIn, signOut, signUp, useSession } = authClient;

// Also export the full client if needed
export { authClient };
