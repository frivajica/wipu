import { create } from "zustand";
import { User } from "@/lib/types";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setUser: (user: Omit<User, "password">) => void;
  clearUser: () => void;
  setHydrated: (value: boolean) => void;
  hydrateFromCookie: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  hasHydrated: false,

  setUser: (user) =>
    set({
      user: { ...user, password: "" },
      isAuthenticated: true,
    }),

  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),

  setHydrated: (value) =>
    set({
      hasHydrated: value,
    }),

  hydrateFromCookie: () => {
    if (typeof document === "undefined") {
      set({ hasHydrated: true });
      return;
    }

    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("wipu_session="));

    if (!cookie) {
      set({ hasHydrated: true });
      return;
    }

    try {
      const value = decodeURIComponent(cookie.split("=")[1]);
      const session = JSON.parse(value) as {
        userId: string;
        email: string;
        name: string;
        expiresAt: string;
      };

      const expiresAt = new Date(session.expiresAt);
      if (expiresAt < new Date()) {
        set({ hasHydrated: true });
        return;
      }

      const user: User = {
        id: session.userId,
        email: session.email,
        name: session.name,
        initials: session.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
        avatarUrl: null,
        password: "", // Not stored in cookie
      };

      set({ user, isAuthenticated: true, hasHydrated: true });
    } catch {
      set({ hasHydrated: true });
    }
  },
}));
