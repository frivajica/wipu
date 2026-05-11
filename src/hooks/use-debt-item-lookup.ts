"use client";

import { useSpaceStore } from "@/stores/space-store";
import { LedgerItem } from "@/lib/types";

export function useDebtItemLookup() {
  const activeSpaceId = useSpaceStore((s) => s.activeSpaceId);

  const findDebtItem = async (description: string): Promise<LedgerItem | undefined> => {
    if (!activeSpaceId) return undefined;
    const res = await fetch(
      `/api/ledger-items?spaceId=${activeSpaceId}&description=${encodeURIComponent(description)}&type=debt&limit=1`
    );
    if (!res.ok) return undefined;
    const data = await res.json();
    return (data.items as LedgerItem[])[0];
  };

  return { findDebtItem };
}
