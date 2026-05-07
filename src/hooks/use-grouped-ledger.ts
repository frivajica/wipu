"use client";

import * as React from "react";
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
  sortByDate,
  pageSize = 5,
}: UseGroupedLedgerOptions) {
  const groupedItems = React.useMemo(() => {
    if (!items.length) return new Map<string, LedgerItem[]>();

    let sortedItems = [...items];
    if (sortByDate) {
      sortedItems = sortItemsByDate(sortedItems);
    }

    return groupItemsByPeriod(
      sortedItems,
      periodType,
      customDateRange || undefined
    );
  }, [items, periodType, customDateRange, sortByDate]);

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
