"use client";

import { useQuery } from "@tanstack/react-query";
import { useSpaceStore } from "@/stores/space-store";
import { useSpaces } from "@/hooks/use-spaces";
import { useMutationWithToast } from "@/hooks/shared/use-mutation-with-toast";

export interface RecurringRule {
  id: string;
  spaceId: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  type: string;
  groupId: string | null;
  frequencyUnit: string;
  intervalCount: number;
  byDay: string | null;
  byMonthDay: number | null;
  startDate: string;
  endDate: string | null;
  count: number | null;
  nextOccurrence: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringRuleUpdate {
  amount?: number;
  description?: string;
  category?: string;
  type?: string;
  groupId?: string | null;
  frequencyUnit?: string;
  intervalCount?: number;
  byDay?: string | null;
  byMonthDay?: number | null;
  startDate?: string;
  endDate?: string | null;
  count?: number | null;
}

export interface CreateRecurringRulePayload {
  spaceId: string;
  amount: number;
  description: string;
  category: string;
  frequencyUnit: string;
  intervalCount: number;
  startDate: string;
}

export function useRecurring() {
  const activeSpaceId = useSpaceStore((s) => s.activeSpaceId);
  const { isLoading: spacesLoading } = useSpaces();

  const { data: rules = [], isPending, isError, refetch } = useQuery({
    queryKey: ["recurring", activeSpaceId],
    queryFn: async (): Promise<RecurringRule[]> => {
      if (!activeSpaceId) return [];
      const res = await fetch(`/api/recurring?spaceId=${activeSpaceId}`);
      if (!res.ok) throw new Error("Failed to fetch recurring rules");
      const data = await res.json();
      return data.rules;
    },
    enabled: !!activeSpaceId && !spacesLoading,
    staleTime: 5 * 60 * 1000,
  });

  const invalidateKeys = [
    ["recurring", activeSpaceId],
    ["balances", activeSpaceId],
  ];

  const createRule = useMutationWithToast({
    mutationFn: async (payload: CreateRecurringRulePayload) => {
      const res = await fetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create recurring rule");
      return res.json();
    },
    successMessage: "Recurring rule created",
    invalidateKeys,
  });

  const updateRule = useMutationWithToast({
    mutationFn: async ({ id, ...payload }: { id: string } & RecurringRuleUpdate) => {
      const res = await fetch(`/api/recurring/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update recurring rule");
      return res.json();
    },
    successMessage: "Recurring rule updated",
    invalidateKeys,
  });

  const toggleActive = useMutationWithToast({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/recurring/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed to update recurring rule");
      return res.json();
    },
    successMessage: "Recurring rule updated",
    invalidateKeys,
  });

  const deleteRule = useMutationWithToast({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/recurring/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete recurring rule");
    },
    successMessage: "Recurring rule deleted",
    invalidateKeys,
  });

  return {
    rules,
    isPending,
    isError,
    refetchRules: refetch,
    createRule: createRule.mutateAsync,
    updateRule: updateRule.mutateAsync,
    toggleActive: toggleActive.mutateAsync,
    deleteRule: deleteRule.mutateAsync,
    isCreating: createRule.isPending,
    isUpdating: updateRule.isPending || toggleActive.isPending,
    isDeleting: deleteRule.isPending,
  };
}