"use client";

import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";
import { useLedger } from "@/hooks/use-ledger";
import { useUIStore } from "@/stores/ui-store";
import { formatCurrency } from "@/lib/formatting";
import { BalanceBar } from "@/components/layout/balance-bar";
import { useScrollTrackingContext } from "@/contexts/scroll-tracking-context";

function BalancePill({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-lg px-2.5 py-1 text-center ${
        highlight ? "bg-primary-accent/10" : "bg-surface-strong"
      }`}
    >
      <p className="text-[9px] font-medium text-text-secondary uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-bold text-text">{formatCurrency(value)}</p>
    </motion.div>
  );
}

export function LedgerBalanceBar() {
  const { balances } = useLedger();
  const sortField = useUIStore((s) => s.sortField);
  const sortDirection = useUIStore((s) => s.sortDirection);
  const { scrollTotal, isSupported } =
    useScrollTrackingContext();

  const globalTotal = balances.totalBalance;
  const isActiveDateSort = sortField === "date" && sortDirection === "desc";
  const displayTotal = isSupported && isActiveDateSort ? scrollTotal : globalTotal;

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

  return (
    <BalanceBar>
      <div ref={barRef} className="flex items-center gap-2">
        <div className="flex items-center gap-2 ml-auto">
          <AnimatePresence mode="popLayout">
            {isSticky && (
              <BalancePill
                key="all-time"
                label="All Time"
                value={globalTotal}
              />
            )}
            <BalancePill
              key="at-this-point"
              label="At This Point"
              value={displayTotal}
              highlight={isActiveDateSort && displayTotal !== globalTotal}
            />
          </AnimatePresence>
        </div>
      </div>
    </BalanceBar>
  );
}
