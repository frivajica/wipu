import { create } from "zustand";
import { User } from "@/lib/types";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setUser: (user: Omit<User, "password">) => void;
  clearUser: () => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  hasHydrated: false,

  setUser: (user) =>
    set({
      user: { ...user, password: "" },
      isAuthenticated: true,
      hasHydrated: true,
    }),

  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
      hasHydrated: true,
    }),

  setHydrated: (value) =>
    set({
      hasHydrated: value,
    }),
}));
