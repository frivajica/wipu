"use client";

import { useMemo } from "react";
import { useSpaceStore } from "@/stores/space-store";
import { mockDb } from "@/lib/data";

export function useDebtAutocomplete(query: string) {
  const activeSpaceId = useSpaceStore((s) => s.activeSpaceId);

  const suggestions = useMemo(() => {
    if (!activeSpaceId || query.length < 1) return [];
    const items = mockDb.getLedgerItems(activeSpaceId);
    const debtDescs = [
      ...new Set(
        items
          .filter((i) => i.type === "debt" && i.amount > 0)
          .map((i) => i.description)
      ),
    ];
    return debtDescs
      .filter((desc) => desc.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }, [activeSpaceId, query]);

  return { suggestions };
}
