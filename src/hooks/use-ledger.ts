"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSpaceStore } from "@/stores/space-store";
import { mockDb } from "@/lib/data.js";
import { LedgerItem } from "@/lib/types";

export function useLedger() {
  const { activeSpaceId } = useSpaceStore();
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ["ledger", activeSpaceId],
    queryFn: async () => {
      if (!activeSpaceId) return [];
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockDb.getLedgerItems(activeSpaceId);
    },
    enabled: !!activeSpaceId,
  });

  const addItemMutation = useMutation({
    mutationFn: async (item: Omit<LedgerItem, "id" | "createdAt" | "updatedAt">) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockDb.createLedgerItem(item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ledger", activeSpaceId] });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<LedgerItem> }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockDb.updateLedgerItem(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ledger", activeSpaceId] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      mockDb.deleteLedgerItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ledger", activeSpaceId] });
    },
  });

  const reorderItemsMutation = useMutation({
    mutationFn: async ({ spaceId, itemIds }: { spaceId: string; itemIds: string[] }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      mockDb.reorderLedgerItems(spaceId, itemIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ledger", activeSpaceId] });
    },
  });

  return {
    items: items || [],
    isLoading,
    addItem: addItemMutation.mutateAsync,
    updateItem: updateItemMutation.mutateAsync,
    deleteItem: deleteItemMutation.mutateAsync,
    reorderItems: reorderItemsMutation.mutateAsync,
    isAdding: addItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    isDeleting: deleteItemMutation.isPending,
    isReordering: reorderItemsMutation.isPending,
  };
}
