"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useLedger } from "@/hooks/use-ledger";
import { useUIStore } from "@/stores/ui-store";
import { formatCurrency } from "@/lib/formatting";
import { SPRING_SNAP } from "@/lib/animations";
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
  const includesDebt = useUIStore((s) => s.includesDebt);
  const setIncludesDebt = useUIStore((s) => s.setIncludesDebt);
  const { scrollTotal, currentPeriodKey, isSupported } =
    useScrollTrackingContext();

  const hasDebt = balances.totalDebt !== 0;
  const globalTotal = includesDebt ? balances.totalBalance : balances.realBalance;
  const displayTotal = isSupported ? scrollTotal : globalTotal;

  const periodTotal = (() => {
    if (!currentPeriodKey) return 0;
    const period = balances.periods.find(
      (p) => p.displayLabel.trim() === currentPeriodKey
    );
    if (!period) return 0;
    return includesDebt ? period.balance + period.debt : period.balance;
  })();

  return (
    <BalanceBar>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer shrink-0">
          <span className="text-xs text-text-secondary hidden sm:inline">
            {includesDebt ? "Hide" : "Show"}
          </span>
          <button
            type="button"
            onClick={() => setIncludesDebt(!includesDebt)}
            className="relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full bg-border-hover transition-colors data-[state=on]:bg-debt"
            data-state={includesDebt ? "on" : "off"}
          >
            <motion.span
              animate={{ x: includesDebt ? 18 : 2 }}
              transition={SPRING_SNAP}
              className="absolute top-0.5 left-0 h-4 w-4 rounded-full bg-white shadow-sm"
            />
          </button>
        </label>

        <span className="text-sm font-bold font-display text-text truncate sm:hidden">
          {currentPeriodKey || "All Time"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-bold font-display text-text truncate hidden sm:block">
          {currentPeriodKey || "All Time"}
        </span>

        <div className="flex items-center gap-2 ml-auto">
          <AnimatePresence mode="popLayout">
            {hasDebt && includesDebt && (
              <motion.div
                key="total-debt"
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="rounded-lg bg-surface-strong px-2.5 py-1 text-center"
              >
                <p className="text-[9px] font-medium text-text-secondary uppercase tracking-wide">
                  Debt
                </p>
                <p className="text-sm font-bold text-debt">
                  {formatCurrency(balances.totalDebt)}
                </p>
              </motion.div>
            )}
            <BalancePill
              key="at-this-point"
              label="At This Point"
              value={displayTotal}
              highlight={isSupported && displayTotal !== globalTotal}
            />
            <BalancePill
              key="period"
              label="Period"
              value={periodTotal}
            />
            <BalancePill
              key="all-time"
              label="All Time"
              value={globalTotal}
            />
          </AnimatePresence>
        </div>
      </div>
    </BalanceBar>
  );
}
