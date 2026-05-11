"use client";

import { useQuery } from "@tanstack/react-query";
import { useSpaceStore } from "@/stores/space-store";
import { useMutationWithToast } from "@/hooks/shared/use-mutation-with-toast";

export interface RecurringRule {
  id: string;
  spaceId: string;
  amount: number;
  description: string;
  category: string;
  type: string;
  frequencyUnit: string;
  intervalCount: number;
  startDate: string;
  nextOccurrence: string;
  isActive: boolean;
}

export function useRecurring() {
  const activeSpaceId = useSpaceStore((s) => s.activeSpaceId);

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["recurring", activeSpaceId],
    queryFn: async (): Promise<RecurringRule[]> => {
      if (!activeSpaceId) return [];
      const res = await fetch(`/api/recurring?spaceId=${activeSpaceId}`);
      if (!res.ok) throw new Error("Failed to fetch recurring rules");
      const data = await res.json();
      return data.rules;
    },
    enabled: !!activeSpaceId,
    staleTime: 5 * 60 * 1000,
  });

  const createRule = useMutationWithToast({
    mutationFn: async (payload: {
      spaceId: string;
      amount: number;
      description: string;
      category: string;
      frequencyUnit: string;
      intervalCount: number;
      startDate: string;
    }) => {
      const res = await fetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create recurring rule");
      return res.json();
    },
    successMessage: "Recurring rule created",
    invalidateKeys: [["recurring", activeSpaceId]],
  });

  return {
    rules,
    isLoading,
    createRule: createRule.mutateAsync,
    isCreating: createRule.isPending,
  };
}
