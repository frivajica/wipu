"use client";

import { useQuery } from "@tanstack/react-query";
import { useSpaceStore } from "@/stores/space-store";
import { useMutationWithToast } from "@/hooks/shared/use-mutation-with-toast";
import { DebtGroup } from "@/lib/types";

export function useDebt() {
  const activeSpaceId = useSpaceStore((s) => s.activeSpaceId);

  const { data: groups, isLoading } = useQuery({
    queryKey: ["debt-groups", activeSpaceId],
    queryFn: async (): Promise<DebtGroup[]> => {
      if (!activeSpaceId) return [];
      const res = await fetch(`/api/debt-groups?spaceId=${activeSpaceId}`);
      if (!res.ok) throw new Error("Failed to fetch debt groups");
      const data = await res.json();
      return data.groups;
    },
    enabled: !!activeSpaceId,
    staleTime: 5 * 60 * 1000,
  });

  const createGroup = useMutationWithToast({
    mutationFn: async (name: string) => {
      if (!activeSpaceId) throw new Error("No active space");
      const res = await fetch("/api/debt-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spaceId: activeSpaceId, name }),
      });
      if (!res.ok) throw new Error("Failed to create debt group");
      return res.json();
    },
    successMessage: "Debt group created",
    invalidateKeys: [["debt-groups", activeSpaceId]],
  });

  const updateGroup = useMutationWithToast({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const res = await fetch(`/api/debt-groups/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to update debt group");
      return res.json();
    },
    successMessage: "Debt group updated",
    invalidateKeys: [["debt-groups", activeSpaceId]],
  });

  const deleteGroup = useMutationWithToast({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/debt-groups/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete debt group");
    },
    successMessage: "Debt group deleted",
    invalidateKeys: [["debt-groups", activeSpaceId]],
  });

  return {
    groups: groups || [],
    isLoading,
    createGroup: createGroup.mutateAsync,
    updateGroup: updateGroup.mutateAsync,
    deleteGroup: deleteGroup.mutateAsync,
    isCreating: createGroup.isPending,
    isUpdating: updateGroup.isPending,
    isDeleting: deleteGroup.isPending,
  };
}
