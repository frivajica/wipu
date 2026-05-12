"use client";

import React from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useSpaceStore } from "@/stores/space-store";
import { useMutationWithToast } from "@/hooks/shared/use-mutation-with-toast";
import { authClient } from "@/lib/auth-client";
import { STORAGE_KEYS } from "@/lib/constants";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

function hydrateUserFromSession(session: { data?: { user: { id: string; email: string; name?: string | null; image?: string | null } } | null }) {
  if (!session.data?.user) return;
  const u = session.data.user;
  useAuthStore.getState().setUser({
    id: u.id,
    email: u.email,
    name: u.name || u.email,
    initials: (u.name || u.email)
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
    avatarUrl: u.image || null,
  });
}

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);
  const setActiveSpace = useSpaceStore((s) => s.setActiveSpace);

  // Hydrate user from Better Auth session on mount (covers direct URL access, refresh, etc.)
  React.useEffect(() => {
    authClient.getSession().then((session) => {
      hydrateUserFromSession(session);
    });
  }, []);

  const loginMutation = useMutationWithToast({
    mutationFn: async ({ email, password }: LoginPayload) => {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        throw new Error(result.error.message || "Login failed");
      }

      // Fetch user data after login
      const session = await authClient.getSession();
      if (session.data?.user) {
        setUser({
          id: session.data.user.id,
          email: session.data.user.email,
          name: session.data.user.name || session.data.user.email,
          initials: (session.data.user.name || session.data.user.email)
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2),
          avatarUrl: session.data.user.image || null,
        });
      }

      return result;
    },
    successMessage: "Signed in successfully",
    invalidateKeys: [["spaces"]],
  });

  const registerMutation = useMutationWithToast({
    mutationFn: async ({ name, email, password }: RegisterPayload) => {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        throw new Error(result.error.message || "Registration failed");
      }

      // After registration, user is auto-signed in
      const session = await authClient.getSession();
      if (session.data?.user) {
        setUser({
          id: session.data.user.id,
          email: session.data.user.email,
          name: session.data.user.name || session.data.user.email,
          initials: (session.data.user.name || session.data.user.email)
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2),
          avatarUrl: session.data.user.image || null,
        });
      }

      return result;
    },
    successMessage: "Account created successfully",
    invalidateKeys: [["spaces"]],
  });

  const logout = async () => {
    await authClient.signOut();
    clearUser();
    setActiveSpace(null);
    localStorage.removeItem(STORAGE_KEYS.SPACES);
  };

  return {
    user,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}
