"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useSpaceStore } from "@/stores/space-store";
import { useMutationWithToast } from "@/hooks/shared/use-mutation-with-toast";
import { User } from "@/lib/types";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);
  const setActiveSpace = useSpaceStore((s) => s.setActiveSpace);

  const loginMutation = useMutationWithToast({
    mutationFn: async ({ email, password }: LoginPayload) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      return data as { user: Omit<User, "password">; defaultSpaceId: string | null };
    },
    successMessage: "Signed in successfully",
    invalidateKeys: [["spaces"]],
    onSuccess: ({ user: loggedInUser, defaultSpaceId }) => {
      setUser(loggedInUser);
      if (defaultSpaceId) setActiveSpace(defaultSpaceId);
    },
  });

  const registerMutation = useMutationWithToast({
    mutationFn: async ({ name, email, password }: RegisterPayload) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      return data as { user: Omit<User, "password">; space: { id: string } };
    },
    successMessage: "Account created successfully",
    invalidateKeys: [["spaces"]],
    onSuccess: ({ user: newUser, space }) => {
      setUser(newUser);
      setActiveSpace(space.id);
    },
  });

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    clearUser();
    setActiveSpace(null);
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
