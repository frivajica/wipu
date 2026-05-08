"use client";

import { useSpaceStore } from "@/stores/space-store";
import { mockDb } from "@/lib/data";
import { LedgerItem } from "@/lib/types";

export function useDebtItemLookup() {
  const activeSpaceId = useSpaceStore((s) => s.activeSpaceId);

  const findDebtItem = (description: string): LedgerItem | undefined => {
    if (!activeSpaceId) return undefined;
    const items = mockDb.getLedgerItems(activeSpaceId);
    return items.find(
      (i) => i.description === description && i.type === "debt"
    );
  };

  return { findDebtItem };
}
