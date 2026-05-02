"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useLedger } from "@/hooks/use-ledger";
import { useSpaces } from "@/hooks/use-spaces";
import { useUIStore } from "@/stores/ui-store";
import { PeriodSelector } from "@/components/ledger/period-selector";
import { SmartDateToggle } from "@/components/ledger/smart-date-toggle";
import { CustomDateRange } from "@/components/ledger/custom-date-range";
import { PeriodGroup } from "@/components/ledger/period-group";
import { SortResetCue } from "@/components/ledger/sort-reset-cue";
import { InfiniteScrollLoader } from "@/components/ledger/infinite-scroll-loader";
import { groupItemsByPeriod, sortItemsByDate } from "@/lib/utils";
import { LedgerItem } from "@/lib/types";
import { DateTime } from "luxon";

export default function LedgerPage() {
  const { user } = useAuth();
  const { activeSpaceId } = useSpaces();
  const { items, isLoading, addItem, updateItem, deleteItem, reorderItems } = useLedger();
  const {
    periodType,
    smartDateInheritance,
    customDateRange,
    sortByDate,
    setPeriodType,
    setSmartDateInheritance,
    setCustomDateRange,
    setSortByDate,
  } = useUIStore();

  const handleAddItem = async (
    item: Omit<LedgerItem, "id" | "createdAt" | "updatedAt">
  ) => {
    await addItem(item);
  };

  const handleEditItem = async (item: LedgerItem) => {
    await updateItem({
      id: item.id,
      updates: {
        amount: item.amount,
        description: item.description,
        category: item.category,
        date: item.date,
        updatedBy: user?.id || item.updatedBy,
      },
    });
  };

  const handleDeleteItem = async (id: string) => {
    await deleteItem(id);
  };

  const handleReorderItems = async (spaceId: string, itemIds: string[]) => {
    await reorderItems({ spaceId, itemIds });
  };

  // Group items by period
  const groupedItems = React.useMemo(() => {
    if (!items.length) return new Map<string, LedgerItem[]>();

    let sortedItems = [...items];

    // Sort by date if enabled
    if (sortByDate) {
      sortedItems = sortItemsByDate(sortedItems);
    }

    return groupItemsByPeriod(
      sortedItems,
      periodType,
      customDateRange || undefined
    );
  }, [items, periodType, customDateRange, sortByDate]);

  // Get period keys sorted by date (most recent first)
  const periodKeys = React.useMemo(() => {
    return Array.from(groupedItems.keys()).reverse();
  }, [groupedItems]);

  // Show only first 2 periods by default, with load more
  const [visibleCount, setVisibleCount] = React.useState(2);
  const visibleKeys = periodKeys.slice(0, visibleCount);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-primary-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-safe">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-text-primary">
            Shared Ledger
          </h1>
          <p className="text-text-secondary mt-1">
            {periodType === "custom" && customDateRange
              ? `Custom range: ${DateTime.fromISO(customDateRange.start).toFormat("MMM d")} - ${DateTime.fromISO(customDateRange.end).toFormat("MMM d")}`
              : "Reviewing multiple periods"}
          </p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-full sm:w-auto">
            <PeriodSelector value={periodType} onChange={setPeriodType} />
          </div>
          <SmartDateToggle
            checked={smartDateInheritance}
            onChange={setSmartDateInheritance}
          />
        </div>
      </div>

      {/* Custom Date Range */}
      <AnimatePresence>
        {periodType === "custom" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          >
            <CustomDateRange
              start={customDateRange?.start || DateTime.now().minus({ months: 1 }).toISODate() || ""}
              end={customDateRange?.end || DateTime.now().toISODate() || ""}
              onChange={setCustomDateRange}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sort Reset Cue */}
      <SortResetCue
        visible={sortByDate && !smartDateInheritance}
        onReset={() => setSortByDate(false)}
      />

      {/* Period Groups */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {visibleKeys.map((key) => (
            <PeriodGroup
              key={key}
              label={key}
              items={groupedItems.get(key) || []}
              onAddItem={handleAddItem}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              onReorderItems={(itemIds) => handleReorderItems(activeSpaceId || "", itemIds)}
              currentUserId={user?.id || ""}
              isDragEnabled={!sortByDate || smartDateInheritance}
            />
          ))}
        </AnimatePresence>

        {visibleKeys.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-surface rounded-xl border border-border"
          >
            <p className="text-text-secondary">No items yet. Add your first transaction!</p>
          </motion.div>
        )}

        {/* Load More */}
        <InfiniteScrollLoader
          isLoading={isLoading}
          hasMore={visibleCount < periodKeys.length}
          onLoadMore={() => setVisibleCount((c) => c + 2)}
        />
      </div>
    </div>
  );
}
