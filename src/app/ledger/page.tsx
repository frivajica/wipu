"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useLedger } from "@/hooks/use-ledger";
import { useSpaces } from "@/hooks/use-spaces";
import { useUIStore } from "@/stores/ui-store";
import { useGroupedLedger } from "@/hooks/use-grouped-ledger";
import { PeriodSelector } from "@/components/ledger/period-selector";
import { ReorderToggle } from "@/components/ledger/reorder-toggle";
import { CustomDateRange } from "@/components/ledger/custom-date-range";
import { PeriodGroup } from "@/components/ledger/period-group";
import { SortResetCue } from "@/components/ledger/sort-reset-cue";
import { InfiniteScrollLoader } from "@/components/ledger/infinite-scroll-loader";
import { LedgerSkeleton } from "@/components/ledger/ledger-skeleton";
import { LedgerEmptyState } from "@/components/ledger/ledger-empty-state";
import { LedgerBalanceHeader } from "@/components/ledger/ledger-balance-header";
import { ExportButton } from "@/components/ledger/export-button";
import { RecurringPanel } from "@/components/ledger/recurring-panel";
import { CreateRecurringRuleModal } from "@/components/ledger/create-recurring-rule-modal";
import { useRecurring } from "@/hooks/use-recurring";
import { DateTime } from "luxon";

export default function LedgerPage() {
  const { user } = useAuth();
  const { activeSpaceId } = useSpaces();
  const { items, isLoading, balances, addItem, updateItem, deleteItem, reorderItems } = useLedger();
  const { rules: recurringRules, createRule } = useRecurring();
  const includesDebt = useUIStore((s) => s.includesDebt);

  const periodType = useUIStore((s) => s.periodType);
  const reorderByDate = useUIStore((s) => s.reorderByDate);
  const customDateRange = useUIStore((s) => s.customDateRange);
  const sortField = useUIStore((s) => s.sortField);
  const sortDirection = useUIStore((s) => s.sortDirection);
  const setPeriodType = useUIStore((s) => s.setPeriodType);
  const setReorderByDate = useUIStore((s) => s.setReorderByDate);
  const setCustomDateRange = useUIStore((s) => s.setCustomDateRange);
  const setSort = useUIStore((s) => s.setSort);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = React.useState(false);

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
      map.set(p.label, {
        balance: p.balance,
        debt: p.debt,
        runningBalance: p.runningBalance,
        runningDebt: p.runningDebt,
        displayLabel: p.displayLabel,
      });
    });
    return map;
  }, [balances.periods]);

  const defaultDateRange = React.useMemo(
    () => ({
      start: DateTime.now().minus({ months: 1 }).toISODate() || "",
      end: DateTime.now().toISODate() || "",
    }),
    []
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

  if (isLoading) return <LedgerSkeleton />;

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
            <ReorderToggle
              checked={reorderByDate}
              onChange={setReorderByDate}
            />
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
          visible={sortField !== null && !reorderByDate}
          sortField={sortField}
          onReset={() => setSort(null)}
        />
      </div>

      <LedgerBalanceHeader />

      <RecurringPanel
        rules={recurringRules}
        onCreate={() => setIsRecurringModalOpen(true)}
      />

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
              reorderByDate={reorderByDate}
              periodStats={periodStatsMap.get(key)}
              includesDebt={includesDebt}
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

      <CreateRecurringRuleModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        onCreate={async (payload) => {
          await createRule({ ...payload, spaceId: activeSpaceId || "" });
        }}
        isCreating={false}
      />
    </div>
  );
}
