"use client";

import { useQuery } from "@tanstack/react-query";
import { useSpaceStore } from "@/stores/space-store";
import { useUIStore } from "@/stores/ui-store";
import { mockDb } from "@/lib/data";
import { LedgerItem, LedgerBalances } from "@/lib/types";
import { simulateDelay } from "@/lib/api-simulation";
import { useMutationWithToast } from "@/hooks/shared/use-mutation-with-toast";

export function useLedger() {
  const activeSpaceId = useSpaceStore((s) => s.activeSpaceId);
  const periodType = useUIStore((s) => s.periodType);

  const { data: items, isLoading } = useQuery({
    queryKey: ["ledger", activeSpaceId],
    queryFn: async (): Promise<LedgerItem[]> => {
      if (!activeSpaceId) return [];
      await simulateDelay(300);
      const rawItems = mockDb.getLedgerItems(activeSpaceId);
      return rawItems.map((item) => {
        const user = mockDb.getUserById(item.updatedBy);
        return { ...item, updatedByName: user?.name || "Unknown" };
      });
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
      await simulateDelay(300);
      return mockDb.getBalances(activeSpaceId, periodType);
    },
    enabled: !!activeSpaceId,
    staleTime: 5 * 60 * 1000,
  });

  const addItem = useMutationWithToast({
    mutationFn: (item: Parameters<typeof mockDb.createLedgerItem>[0]) =>
      mockDb.createLedgerItem(item),
    successMessage: "Item added",
    invalidateKeys: [
      ["ledger", activeSpaceId],
      ["balances", activeSpaceId, periodType],
    ],
  });

  const updateItem = useMutationWithToast({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof mockDb.updateLedgerItem>[1] }) =>
      mockDb.updateLedgerItem(id, updates),
    successMessage: "Item updated",
    invalidateKeys: [
      ["ledger", activeSpaceId],
      ["balances", activeSpaceId, periodType],
    ],
  });

  const deleteItem = useMutationWithToast({
    mutationFn: (id: string) => {
      mockDb.deleteLedgerItem(id);
      return Promise.resolve();
    },
    successMessage: "Item deleted",
    invalidateKeys: [
      ["ledger", activeSpaceId],
      ["balances", activeSpaceId, periodType],
    ],
  });

  const reorderItems = useMutationWithToast({
    mutationFn: ({
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
      if (dateUpdates) {
        Object.entries(dateUpdates).forEach(([id, date]) => {
          mockDb.updateLedgerItem(id, { date, updatedBy: updatedBy || "" });
        });
      }
      mockDb.reorderLedgerItems(spaceId, itemIds);
      return Promise.resolve();
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
