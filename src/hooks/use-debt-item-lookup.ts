"use client";

import { useSpaceStore } from "@/stores/space-store";
import { LedgerItem } from "@/lib/types";

export function useDebtItemLookup() {
  const activeSpaceId = useSpaceStore((s) => s.activeSpaceId);

  const findDebtItem = async (description: string): Promise<LedgerItem | undefined> => {
    if (!activeSpaceId) return undefined;
    const res = await fetch(
      `/api/ledger-items?spaceId=${activeSpaceId}&limit=500`
    );
    if (!res.ok) return undefined;
    const data = await res.json();
    return (data.items as LedgerItem[]).find(
      (i) => i.description === description && i.type === "debt"
    );
  };

  return { findDebtItem };
}
