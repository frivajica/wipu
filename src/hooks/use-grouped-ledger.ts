"use client";

import * as React from "react";
import { DateTime } from "luxon";
import { groupItemsByPeriod, sortItemsByDate } from "@/lib/grouping";
import { LedgerItem, PeriodType } from "@/lib/types";

interface UseGroupedLedgerOptions {
  items: LedgerItem[];
  periodType: PeriodType;
  customDateRange: { start: string; end: string } | null;
  sortByDate: boolean;
  pageSize?: number;
}

export function useGroupedLedger({
  items,
  periodType,
  customDateRange,
  sortByDate: _sortByDate,
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
      groups.set(
        key,
        [...groupItems].sort(
          (a, b) =>
            DateTime.fromISO(b.date).toMillis() - DateTime.fromISO(a.date).toMillis()
        )
      );
    }

    return groups;
  }, [items, periodType, customDateRange]);

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
