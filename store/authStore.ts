import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Interface for the authentication state
 */
interface AuthState {
  /** The current user's ID */
  userId: string | null;
  /** Flag indicating if the user is authenticated */
  isAuthenticated: boolean;
  /** Sets the user ID and authentication status */
  setUser: (userId: string | null) => void;
  /** Clears the user ID and sets authentication status to false */
  clearUser: () => void;
}

/**
 * Zustand store for managing authentication state
 * Uses persist middleware to keep auth state in localStorage
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      isAuthenticated: false,

      setUser: (userId: string | null) => {
        set({
          userId,
          isAuthenticated: !!userId,
        });
      },

      clearUser: () => {
        set({
          userId: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-storage", // localStorage key
    },
  ),
);
