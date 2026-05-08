"use client";

import { useSpaceStore } from "@/stores/space-store";

export function useDebtCategorySync() {
  const activeSpaceId = useSpaceStore((s) => s.activeSpaceId);

  const syncCategory = async (description: string, category: string) => {
    if (!activeSpaceId) return;
    const res = await fetch("/api/debt-category-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spaceId: activeSpaceId, description, category }),
    });
    if (!res.ok) throw new Error("Failed to sync debt category");
  };

  return { syncCategory };
}
