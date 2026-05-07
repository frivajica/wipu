"use client";

import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { useSpaceStore } from "@/stores/space-store";
import { loginAction, registerAction, logoutAction } from "@/lib/actions/auth";
import { mockDb } from "@/lib/data";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);
  const setActiveSpace = useSpaceStore((s) => s.setActiveSpace);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const result = await loginAction(email, password);
      return result;
    },
    onSuccess: ({ user }) => {
      setUser(user);
      const userSpaces = mockDb.getSpacesByUserId(user.id);
      if (userSpaces.length > 0) setActiveSpace(userSpaces[0].id);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async ({ name, email, password }: { name: string; email: string; password: string }) => {
      const result = await registerAction(name, email, password);
      return result;
    },
    onSuccess: ({ user, space }) => {
      setUser(user);
      setActiveSpace(space.id);
    },
  });

  const logout = async () => {
    await logoutAction();
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
