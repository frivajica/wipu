"use client";

import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { useSpaceStore } from "@/stores/space-store";
import { mockDb } from "@/lib/data";
import { simulateDelay } from "@/lib/api-simulation";
import { getInitials, generateId, generateInviteCode } from "@/lib/id-utils";

export function useAuth() {
  const { login: setAuth, logout: clearAuth, user } = useAuthStore();
  const { setSpaces, setActiveSpace } = useSpaceStore();

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      await simulateDelay(500);
      const foundUser = mockDb.getUserByEmail(email);
      if (!foundUser || foundUser.password !== password) {
        throw new Error("Invalid email or password");
      }
      const token = `token-${generateId()}`;
      return { user: foundUser, token };
    },
    onSuccess: ({ user, token }) => {
      setAuth(user, token);
      const userSpaces = mockDb.getSpacesByUserId(user.id);
      setSpaces(userSpaces);
      if (userSpaces.length > 0) setActiveSpace(userSpaces[0].id);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async ({ name, email, password }: { name: string; email: string; password: string }) => {
      await simulateDelay(500);
      const existingUser = mockDb.getUserByEmail(email);
      if (existingUser) throw new Error("Email already registered");

      const newUser = mockDb.createUser({ email, name, password, avatarUrl: null });
      const personalSpace = mockDb.createSpace({
        name: "Personal",
        ownerId: newUser.id,
        members: [newUser.id],
        maxMembers: 8,
      });
      const token = `token-${generateId()}`;
      return { user: newUser, token, space: personalSpace };
    },
    onSuccess: ({ user, token, space }) => {
      setAuth(user, token);
      setSpaces([space]);
      setActiveSpace(space.id);
    },
  });

  const logout = () => {
    clearAuth();
    setSpaces([]);
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
