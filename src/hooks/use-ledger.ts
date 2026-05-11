"use client";

import { useQuery } from "@tanstack/react-query";
import { useSpaceStore } from "@/stores/space-store";
import { useUIStore } from "@/stores/ui-store";
import { LedgerItem, LedgerBalances } from "@/lib/types";
import { useMutationWithToast } from "@/hooks/shared/use-mutation-with-toast";

export function useLedger() {
  const activeSpaceId = useSpaceStore((s) => s.activeSpaceId);
  const periodType = useUIStore((s) => s.periodType);

  const { data: items, isLoading } = useQuery({
    queryKey: ["ledger", activeSpaceId],
    queryFn: async (): Promise<LedgerItem[]> => {
      if (!activeSpaceId) return [];
      const res = await fetch(`/api/ledger-items?spaceId=${activeSpaceId}&limit=500`);
      if (!res.ok) throw new Error("Failed to fetch ledger items");
      const data = await res.json();
      return data.items;
    },
    enabled: !!activeSpaceId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: balances } = useQuery({
    queryKey: ["balances", activeSpaceId, periodType],
    queryFn: async (): Promise<LedgerBalances> => {
      if (!activeSpaceId) {
        return { totalBalance: 0, totalDebt: 0, realBalance: 0, periods: [] };
      }
      const res = await fetch(`/api/balances?spaceId=${activeSpaceId}&periodType=${periodType}`);
      if (!res.ok) throw new Error("Failed to fetch balances");
      return res.json();
    },
    enabled: !!activeSpaceId,
    staleTime: 5 * 60 * 1000,
  });

  const addItem = useMutationWithToast({
    mutationFn: async (item: Omit<LedgerItem, "id" | "createdAt" | "updatedAt" | "sortOrder" | "version">) => {
      const res = await fetch("/api/ledger-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error("Failed to add item");
      return res.json();
    },
    successMessage: "Item added",
    invalidateKeys: [
      ["ledger", activeSpaceId],
      ["balances", activeSpaceId, periodType],
    ],
  });

  const updateItem = useMutationWithToast({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<LedgerItem> }) => {
      const res = await fetch(`/api/ledger-items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      if (!res.ok) throw new Error("Failed to update item");
      return res.json();
    },
    successMessage: "Item updated",
    invalidateKeys: [
      ["ledger", activeSpaceId],
      ["balances", activeSpaceId, periodType],
    ],
  });

  const deleteItem = useMutationWithToast({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/ledger-items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete item");
    },
    successMessage: "Item deleted",
    invalidateKeys: [
      ["ledger", activeSpaceId],
      ["balances", activeSpaceId, periodType],
    ],
  });

  const reorderItems = useMutationWithToast({
    mutationFn: async ({
      spaceId,
      itemIds,
      dateUpdates,
      updatedBy,
    }: {
      spaceId: string;
      itemIds: string[];
      dateUpdates?: Record<string, string>;
      updatedBy?: string;
    }) => {
      const res = await fetch("/api/ledger-items/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spaceId, itemIds, dateUpdates, updatedBy }),
      });
      if (!res.ok) throw new Error("Failed to reorder items");
      return res.json();
    },
    successMessage: "Order updated",
    invalidateKeys: [
      ["ledger", activeSpaceId],
      ["balances", activeSpaceId, periodType],
    ],
  });

  return {
    items: items || [],
    isLoading,
    balances: balances || { totalBalance: 0, totalDebt: 0, realBalance: 0, periods: [] },
    addItem: addItem.mutateAsync,
    updateItem: updateItem.mutateAsync,
    deleteItem: deleteItem.mutateAsync,
    reorderItems: reorderItems.mutateAsync,
    isAdding: addItem.isPending,
    isUpdating: updateItem.isPending,
    isDeleting: deleteItem.isPending,
    isReordering: reorderItems.isPending,
  };
}
