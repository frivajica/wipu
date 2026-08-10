"use client";

import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";
import { useLedger } from "@/hooks/use-ledger";
import { useUIStore } from "@/stores/ui-store";
import { formatCurrency } from "@/lib/formatting";
import { BalanceBar } from "@/components/layout/balance-bar";
import { useScrollTrackingContext } from "@/contexts/scroll-tracking-context";
import { useDndActive } from "@/contexts/dnd-active-context";
import { useAuth } from "@/hooks/use-auth";
import { useSpaces } from "@/hooks/use-spaces";
import { Plus } from "lucide-react";
import { SPRING_DEFAULT } from "@/lib/animations";
import { getMidpointDate } from "@/lib/date-utils";
import { DateTime } from "luxon";
import { AddItemRow } from "./add-item-row";

export function LedgerBalanceBar() {
  const { balances, items, addItem } = useLedger();
  const { user } = useAuth();
  const { activeSpaceId } = useSpaces();
  const sortField = useUIStore((s) => s.sortField);
  const sortDirection = useUIStore((s) => s.sortDirection);
  const { scrollTotal, isSupported, activeItemId } =
    useScrollTrackingContext();
  const isDragActive = useDndActive();

  const [isAdding, setIsAdding] = React.useState(false);
  const [frozenTotal, setFrozenTotal] = React.useState<number | null>(null);

  const globalTotal = balances.totalBalance;
  const isActiveDateSort = sortField === "date" && sortDirection === "desc";
  const displayTotal = isSupported && isActiveDateSort ? scrollTotal : globalTotal;

  React.useEffect(() => {
    if (isDragActive && frozenTotal === null) {
      setFrozenTotal(displayTotal);
    }
    if (!isDragActive && frozenTotal !== null) {
      setFrozenTotal(null);
    }
  }, [isDragActive, displayTotal, frozenTotal]);

  const effectiveTotal = frozenTotal ?? displayTotal;

  const barRef = React.useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = React.useState(false);
  const initialTopRef = React.useRef(0);
  const frameRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (barRef.current) {
      initialTopRef.current = barRef.current.getBoundingClientRect().top + window.scrollY;
    }
    const handleScroll = () => {
      if (!frameRef.current) {
        frameRef.current = requestAnimationFrame(() => {
          setIsSticky(window.scrollY >= initialTopRef.current);
          frameRef.current = null;
        });
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const computeDefaultDate = React.useCallback((): string => {
    if (!activeItemId || items.length === 0) {
      return DateTime.now().toISODate() || "";
    }

    const sorted = [...items].sort((a, b) => {
      const dateDiff = DateTime.fromISO(a.date).toMillis() - DateTime.fromISO(b.date).toMillis();
      if (dateDiff !== 0) return dateDiff;
      return a.sortOrder - b.sortOrder;
    });

    const activeIndex = sorted.findIndex((item) => item.id === activeItemId);

    if (activeIndex > 0) {
      return getMidpointDate(sorted[activeIndex - 1].date, sorted[activeIndex].date);
    }

    return DateTime.now().toISODate() || "";
  }, [activeItemId, items]);

  const handleAdd = React.useCallback(async (data: {
    amount: number;
    description: string;
    category: string;
    date: string;
    type: "default" | "debt";
    groupId: string | null;
  }) => {
    await addItem({
      ...data,
      spaceId: activeSpaceId || "",
      createdBy: user?.id || "",
      updatedBy: user?.id || "",
      type: data.type,
      groupId: data.groupId,
    });
    setIsAdding(false);
  }, [addItem, activeSpaceId, user?.id]);

  return (
    <BalanceBar>
      <motion.div ref={barRef} layout transition={SPRING_DEFAULT} className="flex items-center gap-2 w-full">
        <AnimatePresence mode="wait">
          {isAdding ? (
            <motion.div
              layoutId="add-container"
              initial={false}
              transition={SPRING_DEFAULT}
              className="flex-1"
            >
              <div className="rounded-xl bg-primary-accent/3 border border-primary-accent/15 shadow-card overflow-hidden">
                <AddItemRow
                  onSubmit={handleAdd}
                  onCancel={() => setIsAdding(false)}
                  defaultDate={computeDefaultDate()}
                />
              </div>
            </motion.div>
          ) : (
            <motion.button
              layoutId="add-container"
              transition={SPRING_DEFAULT}
              onClick={() => setIsAdding(true)}
              className={
                "flex-1 py-2 px-3 flex items-center justify-center gap-2 text-sm font-medium cursor-pointer " +
                "rounded-xl bg-surface border border-border/40 border-dashed " +
                "text-text-tertiary hover:text-primary-accent hover:border-primary-accent/30 hover:bg-primary-accent/2 " +
                "transition-all duration-200 ease-out"
              }
            >
              <Plus className="h-4 w-4" />
              Add New
            </motion.button>
          )}
        </AnimatePresence>

        <motion.div
          layout
          animate={
            isAdding
              ? { width: 0, opacity: 0, overflow: "hidden" }
              : { width: "auto", opacity: 1, overflow: "visible" }
          }
          transition={SPRING_DEFAULT}
          className="flex items-center gap-2 flex-shrink-0"
        >
          {isSticky && (
            <div className="rounded-lg px-2.5 py-1 text-center bg-surface-strong whitespace-nowrap">
              <p className="text-[9px] font-medium text-text-secondary uppercase tracking-wide">
                All Time
              </p>
              <p className="text-sm font-bold text-text">{formatCurrency(globalTotal)}</p>
            </div>
          )}
          <div
            className={`rounded-lg px-2.5 py-1 text-center whitespace-nowrap ${
              isActiveDateSort && effectiveTotal !== globalTotal
                ? "bg-primary-accent/10"
                : "bg-surface-strong"
            }`}
          >
            <p className="text-[9px] font-medium text-text-secondary uppercase tracking-wide">
              At This Point
            </p>
            <p className="text-sm font-bold text-text">{formatCurrency(effectiveTotal)}</p>
          </div>
        </motion.div>
      </motion.div>
    </BalanceBar>
  );
}