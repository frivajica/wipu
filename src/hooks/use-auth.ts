"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useSpaceStore } from "@/stores/space-store";
import { loginAction, registerAction, logoutAction } from "@/lib/actions/auth";
import { useMutationWithToast } from "@/hooks/shared/use-mutation-with-toast";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);
  const setActiveSpace = useSpaceStore((s) => s.setActiveSpace);

  const loginMutation = useMutationWithToast({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginAction(email, password),
    successMessage: "Signed in successfully",
    invalidateKeys: [["spaces"]],
    onSuccess: ({ user: loggedInUser, defaultSpaceId }) => {
      setUser(loggedInUser);
      if (defaultSpaceId) setActiveSpace(defaultSpaceId);
    },
  });

  const registerMutation = useMutationWithToast({
    mutationFn: ({
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    }) => registerAction(name, email, password),
    successMessage: "Account created successfully",
    invalidateKeys: [["spaces"]],
    onSuccess: ({ user: newUser, space }) => {
      setUser(newUser);
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
