import { useCallback, useEffect, useState } from "react";
import { authClient } from "./auth-client";

type SessionData = {
  session: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null | undefined | undefined;
    userAgent?: string | null | undefined | undefined;
  };
  user: {
    createdAt: Date;
    email: string;
    emailVerified: boolean;
    id: string;
    image: string;
    name: string;
    updatedAt: Date;
  };
};

export function useAuthSession() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/use-session", {
        // Add cache: 'no-store' to prevent browser caching
        cache: "no-store",
        // Add a timestamp to prevent caching
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch session");
      }
      const data = await response.json();
      setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error("Error fetching session:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Refresh function
  const refresh = useCallback(() => {
    fetchSession();
  }, [fetchSession]);

  return {
    session,
    loading,
    error,
    refresh,
    signOut: authClient.signOut,
  };
}
