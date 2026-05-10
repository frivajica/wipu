"use client";

import * as React from "react";
import { DateTime } from "luxon";
import { groupItemsByPeriod, sortItemsByDate } from "@/lib/grouping";
import { LedgerItem, PeriodType } from "@/lib/types";

interface UseGroupedLedgerOptions {
  items: LedgerItem[];
  periodType: PeriodType;
  customDateRange: { start: string; end: string } | null;
  sortField: "date" | "amount" | "description" | "category" | "profile" | null;
  sortDirection: "asc" | "desc";
  pageSize?: number;
}

export function useGroupedLedger({
  items,
  periodType,
  customDateRange,
  sortField,
  sortDirection,
  pageSize = 5,
}: UseGroupedLedgerOptions) {
  const groupedItems = React.useMemo(() => {
    if (!items.length) return new Map<string, LedgerItem[]>();

    const dateSorted = sortItemsByDate([...items]);
    const groups = groupItemsByPeriod(
      dateSorted,
      periodType,
      customDateRange || undefined
    );

    for (const [key, groupItems] of groups) {
      if (sortField) {
        groups.set(
          key,
          [...groupItems].sort((a, b) => {
            let result = 0;
            switch (sortField) {
              case "date":
                result = DateTime.fromISO(b.date).toMillis() - DateTime.fromISO(a.date).toMillis();
                break;
              case "amount":
                result = a.amount - b.amount;
                break;
              case "description":
                result = a.description.localeCompare(b.description);
                break;
              case "category":
                result = a.category.localeCompare(b.category);
                break;
              case "profile":
                result = (a.updatedByName || "").localeCompare(b.updatedByName || "");
                break;
            }
            return sortDirection === "desc" ? result : -result;
          })
        );
      } else {
        // Default manual order
        groups.set(
          key,
          [...groupItems].sort((a, b) => a.sortOrder - b.sortOrder)
        );
      }
    }

    return groups;
  }, [items, periodType, customDateRange, sortField, sortDirection]);

  const periodKeys = React.useMemo(
    () => Array.from(groupedItems.keys()).reverse(),
    [groupedItems]
  );

  const [visibleCount, setVisibleCount] = React.useState(pageSize);
  const visibleKeys = periodKeys.slice(0, visibleCount);
  const hasMore = visibleCount < periodKeys.length;

  const loadMore = () => setVisibleCount((c) => c + pageSize);

  return { groupedItems, periodKeys, visibleKeys, hasMore, loadMore };
}
