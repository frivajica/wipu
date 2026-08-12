"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useAuth } from "@/hooks/use-auth";
import { useLedger } from "@/hooks/use-ledger";
import { useSpaces } from "@/hooks/use-spaces";
import { useUIStore } from "@/stores/ui-store";
import { useGroupedLedger } from "@/hooks/use-grouped-ledger";
import { PeriodSelector } from "@/components/ledger/period-selector";
import { CustomDateRange } from "@/components/ledger/custom-date-range";
import { PeriodGroup } from "@/components/ledger/period-group";
import { SortResetCue } from "@/components/ledger/sort-reset-cue";
import { InfiniteScrollLoader } from "@/components/ledger/infinite-scroll-loader";
import { LedgerSkeleton } from "@/components/ledger/ledger-skeleton";
import { LedgerEmptyState } from "@/components/ledger/ledger-empty-state";
import { LedgerBalanceBar } from "@/components/ledger/ledger-balance-bar";
import { ErrorState } from "@/components/ui/error-state";
import { NoActiveSpace } from "@/components/ui/no-active-space";
import { ExportButton } from "@/components/ledger/export-button";
import { CursorLine } from "@/components/ledger/cursor-line";
import { ScrollTrackingProvider } from "@/contexts/scroll-tracking-context";
import { DateTime } from "luxon";

export default function LedgerPage() {
  const { user } = useAuth();
  const {
    activeSpaceId,
    isLoading: spacesLoading,
    isError: spacesError,
    refetchSpaces,
  } = useSpaces();
  const { items, isPending, isError, refetchItems, balances, addItem, updateItem, deleteItem, reorderItems } = useLedger();

  const periodType = useUIStore((s) => s.periodType);
  const customDateRange = useUIStore((s) => s.customDateRange);
  const sortField = useUIStore((s) => s.sortField);
  const sortDirection = useUIStore((s) => s.sortDirection);
  const setPeriodType = useUIStore((s) => s.setPeriodType);
  const setCustomDateRange = useUIStore((s) => s.setCustomDateRange);
  const setSort = useUIStore((s) => s.setSort);

  const { groupedItems, visibleKeys, hasMore, loadMore } = useGroupedLedger({
    items,
    periodType,
    customDateRange,
    sortField,
    sortDirection,
  });

  const periodStatsMap = React.useMemo(() => {
    const map = new Map<string, { balance: number; debt: number; runningBalance: number; runningDebt: number; displayLabel: string }>();
    balances.periods.forEach((p) => {
      map.set(p.displayLabel.trim(), {
        balance: p.balance,
        debt: p.debt,
        runningBalance: p.runningBalance,
        runningDebt: p.runningDebt,
        displayLabel: p.displayLabel.trim(),
      });
    });
    return map;
  }, [balances.periods]);

  const flatItems = React.useMemo(() => {
    const result: Array<{ id: string; amount: number; type: string; date: string }> = [];
    for (const key of visibleKeys) {
      const group = groupedItems.get(key);
      if (group) {
        for (const item of group) {
          result.push({ id: item.id, amount: item.amount, type: item.type, date: item.date });
        }
      }
    }
    return result;
  }, [visibleKeys, groupedItems]);

  const flatItemIds = React.useMemo(() => flatItems.map((i) => i.id), [flatItems]);

  const globalTotal = balances.totalBalance;

  const defaultDateRange = React.useMemo(
    () => ({
      start: DateTime.now().minus({ months: 1 }).toISODate() || "",
      end: DateTime.now().toISODate() || "",
    }),
    []
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  const handleAddFirstItem = React.useCallback(
    async (data: {
      amount: number;
      description: string;
      category: string;
      date: string;
      type?: "default" | "debt";
      groupId?: string | null;
    }) => {
      await addItem({
        ...data,
        spaceId: activeSpaceId || "",
        createdBy: user?.id || "",
        updatedBy: user?.id || "",
        type: data.type || "default",
        groupId: data.groupId || null,
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
    (itemIds: string[], dateUpdates?: Record<string, string>) => {
      return reorderItems({
        spaceId: activeSpaceId || "",
        itemIds,
        dateUpdates,
        updatedBy: user?.id,
      });
    },
    [reorderItems, activeSpaceId, user?.id]
  );

  const handleDragEnd = React.useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = String(active.id);
    const overId = over ? String(over.id) : null;

    const activeIndex = flatItems.findIndex((i) => i.id === activeId);
    if (activeIndex === -1) return;

    let targetIndex: number;
    if (overId) {
      targetIndex = flatItems.findIndex((i) => i.id === overId);
      if (targetIndex === -1) return;
    } else {
      return;
    }

    const newItems = arrayMove(flatItems, activeIndex, targetIndex);
    const movedIndex = targetIndex > activeIndex ? targetIndex - 1 : targetIndex;
    const before = newItems[movedIndex - 1];
    const after = newItems[movedIndex + 1];

    let newDate: string;
    if (before && after) {
      const start = new Date(before.date).getTime();
      const end = new Date(after.date).getTime();
      newDate = new Date(start + (end - start) / 2).toISOString().split("T")[0];
    } else {
      newDate = (before || after).date;
    }

    updateItem({
      id: activeId,
      updates: {
        date: newDate,
        updatedBy: user?.id || "",
      },
    });
  }, [flatItems, updateItem, user?.id]);

  const isDragEnabled = sortField === null || sortField === "date";

  if (spacesError) {
    return <ErrorState message="Couldn't load your spaces." onRetry={refetchSpaces} />;
  }
  if (spacesLoading) return <LedgerSkeleton />;
  if (!activeSpaceId) return <NoActiveSpace />;
  if (isPending) return <LedgerSkeleton />;
  if (isError) return <ErrorState onRetry={refetchItems} />;

  return (
    <div className="space-y-6 pb-safe">
      <div className="flex flex-col">
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
            <ExportButton spaceId={activeSpaceId} />
          </div>
        </div>

        <AnimatePresence>
          {periodType === "custom" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 35 }}
              className="overflow-hidden"
            >
              <div className="pt-6">
                <CustomDateRange
                  start={customDateRange?.start || defaultDateRange.start}
                  end={customDateRange?.end || defaultDateRange.end}
                  onChange={setCustomDateRange}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <SortResetCue
          visible={sortField !== null && sortField !== "date"}
          sortField={sortField}
          onReset={() => setSort(null)}
        />
      </div>

      <ScrollTrackingProvider
        items={flatItems}
        initialTotal={globalTotal}
      >
        {isDragEnabled ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={flatItemIds}
              strategy={verticalListSortingStrategy}
            >
              <LedgerBalanceBar />
              <CursorLine />

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
                      periodStats={periodStatsMap.get(key)}
                    />
                  ))}
                </AnimatePresence>

                {visibleKeys.length === 0 && (
                  <LedgerEmptyState onAdd={handleAddFirstItem} />
                )}

                <InfiniteScrollLoader
                  hasMore={hasMore}
                  onLoadMore={loadMore}
                  hasItems={items.length > 0}
                />
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <>
            <LedgerBalanceBar />
            <CursorLine />

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
                    periodStats={periodStatsMap.get(key)}
                  />
                ))}
              </AnimatePresence>

              {visibleKeys.length === 0 && (
                <LedgerEmptyState onAdd={handleAddFirstItem} />
              )}

              <InfiniteScrollLoader
                hasMore={hasMore}
                onLoadMore={loadMore}
                hasItems={items.length > 0}
              />
            </div>
          </>
        )}
      </ScrollTrackingProvider>
    </div>
  );
}
