"use client";

import { useQuery } from "@tanstack/react-query";
import { useSpaceStore } from "@/stores/space-store";

export function useAutocomplete(type: "description" | "category", query: string) {
  const activeSpaceId = useSpaceStore((s) => s.activeSpaceId);

  const { data: suggestions = [] } = useQuery({
    queryKey: ["autocomplete", type, query, activeSpaceId],
    queryFn: async () => {
      if (!activeSpaceId || query.length < 1) return [];
      const res = await fetch(
        `/api/autocomplete?field=${type}&q=${encodeURIComponent(query)}&spaceId=${activeSpaceId}`
      );
      if (!res.ok) throw new Error("Failed to fetch suggestions");
      const data = await res.json();
      return data.suggestions as string[];
    },
    enabled: !!activeSpaceId && query.length >= 1,
    staleTime: 30 * 1000,
  });

  return { suggestions };
}
