"use client";

import { useQuery } from "@tanstack/react-query";
import { useSpaceStore } from "@/stores/space-store";

export function useDebtAutocomplete(query: string) {
  const activeSpaceId = useSpaceStore((s) => s.activeSpaceId);

  const { data: suggestions = [] } = useQuery({
    queryKey: ["autocomplete", "debt-description", query, activeSpaceId],
    queryFn: async () => {
      if (!activeSpaceId || query.length < 1) return [];
      const res = await fetch(
        `/api/autocomplete?field=description&q=${encodeURIComponent(query)}&spaceId=${activeSpaceId}`
      );
      if (!res.ok) throw new Error("Failed to fetch suggestions");
      const data = await res.json();
      // Filter to debt items only on client for now
      // In future, add type=debt filter to API
      return (data.suggestions as string[]).slice(0, 5);
    },
    enabled: !!activeSpaceId && query.length >= 1,
    staleTime: 30 * 1000,
  });

  return { suggestions };
}
