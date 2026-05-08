"use client";

import { useMemo } from "react";
import { useSpaceStore } from "@/stores/space-store";
import { mockDb } from "@/lib/data";

export function useAutocomplete(type: "description" | "category", query: string) {
  const activeSpaceId = useSpaceStore((s) => s.activeSpaceId);

  const suggestions = useMemo(() => {
    if (!activeSpaceId || query.length < 1) return [];

    if (type === "description") {
      const items = mockDb.getLedgerItems(activeSpaceId);
      const descriptions = [...new Set(items.map((item) => item.description))];
      return descriptions
        .filter((desc) => desc.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);
    }

    if (type === "category") {
      const categories = mockDb.getCategories(activeSpaceId);
      return categories
        .filter((cat) => cat.name.toLowerCase().includes(query.toLowerCase()))
        .map((cat) => cat.name)
        .slice(0, 5);
    }

    return [];
  }, [activeSpaceId, type, query]);

  return { suggestions };
}
