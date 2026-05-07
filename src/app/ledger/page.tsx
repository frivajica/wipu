"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useLedger } from "@/hooks/use-ledger";
import { useSpaces } from "@/hooks/use-spaces";
import { useUIStore } from "@/stores/ui-store";
import { useGroupedLedger } from "@/hooks/use-grouped-ledger";
import { PeriodSelector } from "@/components/ledger/period-selector";
import { SmartDateToggle } from "@/components/ledger/smart-date-toggle";
import { CustomDateRange } from "@/components/ledger/custom-date-range";
import { PeriodGroup } from "@/components/ledger/period-group";
import { SortResetCue } from "@/components/ledger/sort-reset-cue";
import { InfiniteScrollLoader } from "@/components/ledger/infinite-scroll-loader";
import { LedgerSkeleton } from "@/components/ledger/ledger-skeleton";
import { LedgerEmptyState } from "@/components/ledger/ledger-empty-state";
import { DateTime } from "luxon";

export default function LedgerPage() {
  const { user } = useAuth();
  const { activeSpaceId } = useSpaces();
  const { items, isLoading, addItem, updateItem, deleteItem, reorderItems } = useLedger();

  // Granular Zustand selectors — each subscribes to only one property
  const periodType = useUIStore((s) => s.periodType);
  const smartDateInheritance = useUIStore((s) => s.smartDateInheritance);
  const customDateRange = useUIStore((s) => s.customDateRange);
  const sortByDate = useUIStore((s) => s.sortByDate);
  const setPeriodType = useUIStore((s) => s.setPeriodType);
  const setSmartDateInheritance = useUIStore((s) => s.setSmartDateInheritance);
  const setCustomDateRange = useUIStore((s) => s.setCustomDateRange);
  const setSortByDate = useUIStore((s) => s.setSortByDate);

  const { groupedItems, visibleKeys, hasMore, loadMore } = useGroupedLedger({
    items,
    periodType,
    customDateRange,
    sortByDate,
  });

  const handleAddFirstItem = React.useCallback(
    async (data: {
      amount: number;
      description: string;
      category: string;
      date: string;
    }) => {
      await addItem({
        ...data,
        spaceId: activeSpaceId || "",
        createdBy: user?.id || "",
        updatedBy: user?.id || "",
        sortOrder: 0,
      });
    },
    [addItem, activeSpaceId, user?.id]
  );

  const handleEditItem = React.useCallback(
    (item: { id: string; amount: number; description: string; category: string; date: string; updatedBy: string }) => {
      return updateItem({
        id: item.id,
        updates: {
          amount: item.amount,
          description: item.description,
          category: item.category,
          date: item.date,
          updatedBy: user?.id || item.updatedBy,
        },
      });
    },
    [updateItem, user?.id]
  );

  const handleReorderItems = React.useCallback(
    (itemIds: string[]) => {
      return reorderItems({ spaceId: activeSpaceId || "", itemIds });
    },
    [reorderItems, activeSpaceId]
  );

  if (isLoading) return <LedgerSkeleton />;

  return (
    <div className="space-y-6 pb-safe">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-text-primary">
            Shared Ledger
          </h1>
          {periodType === "custom" && customDateRange && (
            <p className="text-text-secondary mt-1">
              Custom range: {DateTime.fromISO(customDateRange.start).toFormat("MMM d")} - {DateTime.fromISO(customDateRange.end).toFormat("MMM d")}
            </p>
          )}
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
            transition={{ type: "spring" as const, stiffness: 400, damping: 35 }}
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
              onAddItem={addItem}
              onEditItem={handleEditItem}
              onDeleteItem={deleteItem}
              onReorderItems={handleReorderItems}
              currentUserId={user?.id || ""}
              isDragEnabled={!sortByDate || smartDateInheritance}
            />
          ))}
        </AnimatePresence>

        {visibleKeys.length === 0 && (
          <LedgerEmptyState onAdd={handleAddFirstItem} />
        )}

        <InfiniteScrollLoader
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={loadMore}
          hasItems={items.length > 0}
        />
      </div>
    </div>
  );
}
