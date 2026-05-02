"use client";

import { useQuery } from "@tanstack/react-query";
import { useSpaceStore } from "@/stores/space-store";
import { mockDb } from "@/lib/data";
import { LedgerItem } from "@/lib/types";
import { simulateDelay } from "@/lib/api-simulation";
import { useMutationWithToast } from "@/hooks/shared/use-mutation-with-toast";

export function useLedger() {
  const { activeSpaceId } = useSpaceStore();

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
  });

  const addItem = useMutationWithToast({
    mutationFn: (item: Parameters<typeof mockDb.createLedgerItem>[0]) =>
      mockDb.createLedgerItem(item),
    successMessage: "Item added",
    invalidateKeys: [["ledger", activeSpaceId]],
  });

  const updateItem = useMutationWithToast({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof mockDb.updateLedgerItem>[1] }) =>
      mockDb.updateLedgerItem(id, updates),
    successMessage: "Item updated",
    invalidateKeys: [["ledger", activeSpaceId]],
  });

  const deleteItem = useMutationWithToast({
    mutationFn: (id: string) => {
      mockDb.deleteLedgerItem(id);
      return Promise.resolve();
    },
    successMessage: "Item deleted",
    invalidateKeys: [["ledger", activeSpaceId]],
  });

  const reorderItems = useMutationWithToast({
    mutationFn: ({ spaceId, itemIds }: { spaceId: string; itemIds: string[] }) => {
      mockDb.reorderLedgerItems(spaceId, itemIds);
      return Promise.resolve();
    },
    successMessage: "Order updated",
    invalidateKeys: [["ledger", activeSpaceId]],
  });

  return {
    items: items || [],
    isLoading,
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
