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
    queryFn: async () => {
      if (!activeSpaceId) return [];
      await simulateDelay(300);
      return mockDb.getLedgerItems(activeSpaceId);
    },
    enabled: !!activeSpaceId,
  });

  const addItem = useMutationWithToast({
    mutationFn: (item: Omit<LedgerItem, "id" | "createdAt" | "updatedAt">) =>
      mockDb.createLedgerItem(item),
    successMessage: "Item added",
    invalidateKeys: [["ledger", activeSpaceId]],
  });

  const updateItem = useMutationWithToast({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<LedgerItem> }) =>
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
