"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useLedger } from "@/hooks/use-ledger";
import { useUIStore } from "@/stores/ui-store";
import { formatCurrency } from "@/lib/formatting";
import { SPRING_SNAP } from "@/lib/animations";
import { BalanceBar } from "@/components/layout/balance-bar";

export function LedgerBalanceBar() {
  const { balances } = useLedger();
  const includesDebt = useUIStore((s) => s.includesDebt);
  const setIncludesDebt = useUIStore((s) => s.setIncludesDebt);

  const hasDebt = balances.totalDebt !== 0;
  const total = includesDebt ? balances.totalBalance : balances.realBalance;

  return (
    <BalanceBar>
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
          <motion.div
            key="total"
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="rounded-lg bg-surface-strong px-2.5 py-1 text-center"
          >
            <p className="text-[9px] font-medium text-text-secondary uppercase tracking-wide">
              Total
            </p>
            <p className="text-sm font-bold text-text">
              {formatCurrency(total)}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </BalanceBar>
  );
}
