import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthState, User } from "@/lib/types";
import { STORAGE_KEYS } from "@/lib/constants";

interface AuthStore extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),

      hydrate: () => {
        // Hydration is handled automatically by persist middleware
      },
    }),
    {
      name: STORAGE_KEYS.AUTH,
    }
  )
);
