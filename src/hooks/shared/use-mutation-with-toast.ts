"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastStore } from "@/components/ui/toast";

interface UseMutationWithToastOptions<TData, TVariables> {
  mutationFn: (vars: TVariables) => TData | Promise<TData>;
  successMessage: string;
  errorMessage?: string;
  invalidateKeys?: (string | null)[][];
}

export function useMutationWithToast<TData, TVariables>({
  mutationFn,
  successMessage,
  errorMessage,
  invalidateKeys = [],
}: UseMutationWithToastOptions<TData, TVariables>) {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: async (vars: TVariables) => {
      return await mutationFn(vars);
    },
    onSuccess: () => {
      invalidateKeys.forEach((key) => {
        const validKey = key.filter((k): k is string => k !== null);
        if (validKey.length > 0) {
          queryClient.invalidateQueries({ queryKey: validKey });
        }
      });
      addToast(successMessage, "success");
    },
    onError: (error) => {
      const message = errorMessage || (error instanceof Error ? error.message : "Something went wrong");
      addToast(message, "error");
    },
  });
}
