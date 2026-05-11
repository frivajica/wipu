"use client";

import { useQuery } from "@tanstack/react-query";
import { useSpaceStore } from "@/stores/space-store";
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

  return {
    groups: groups || [],
    isLoading,
  };
}
