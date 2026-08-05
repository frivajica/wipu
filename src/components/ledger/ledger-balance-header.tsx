"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useLedger } from "@/hooks/use-ledger";
import { useUIStore } from "@/stores/ui-store";
import { formatCurrency } from "@/lib/formatting";
import { SPRING_GENTLE, SPRING_SNAP } from "@/lib/animations";
import { Calendar, X } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export function LedgerBalanceHeader() {
  const { balances } = useLedger();
  const includesDebt = useUIStore((s) => s.includesDebt);
  const setIncludesDebt = useUIStore((s) => s.setIncludesDebt);
  const balanceCutoffDate = useUIStore((s) => s.balanceCutoffDate);
  const setBalanceCutoffDate = useUIStore((s) => s.setBalanceCutoffDate);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const hasDebt = balances.totalDebt !== 0;
  const total = includesDebt ? balances.totalBalance : balances.realBalance;

  const formattedDate = balanceCutoffDate
    ? new Date(balanceCutoffDate + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING_GENTLE}
      className="rounded-xl bg-surface p-3 shadow-sm border border-border"
    >
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-base font-semibold text-text">Balance Overview</h2>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm text-text-secondary">
            {includesDebt ? "Hide Debt" : "Show Debt"}
          </span>
          <button
            type="button"
            onClick={() => setIncludesDebt(!includesDebt)}
            className="relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full bg-border-hover transition-colors data-[state=on]:bg-debt"
            data-state={includesDebt ? "on" : "off"}
          >
            <motion.span
              animate={{ x: includesDebt ? 22 : 2 }}
              transition={SPRING_SNAP}
              className="absolute top-1 left-0 h-4 w-4 rounded-full bg-white shadow-sm"
            />
          </button>
        </label>
      </div>

      <div className="flex items-center justify-between mb-2.5">
        <button
          type="button"
          onClick={() => dateInputRef.current?.showPicker()}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface-strong border border-border hover:border-primary-accent/40 text-sm text-text-secondary hover:text-text transition-colors cursor-pointer"
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>{formattedDate ?? "No cutoff"}</span>
        </button>
        <input
          ref={dateInputRef}
          type="date"
          value={balanceCutoffDate ?? ""}
          onChange={(e) => setBalanceCutoffDate(e.target.value || null)}
          className="sr-only"
        />
        <AnimatePresence>
          {balanceCutoffDate && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={SPRING_SNAP}
              type="button"
              onClick={() => setBalanceCutoffDate(null)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-strong border border-border hover:border-error/40 text-sm text-text-secondary hover:text-error transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-between gap-2">
        <AnimatePresence mode="popLayout">
          {hasDebt && includesDebt && (
            <motion.div
              key="total-debt"
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={SPRING_GENTLE}
              className="flex-1"
            >
              <BalancePill
                label="Total Debt"
                value={balances.totalDebt}
                color="text-debt"
              />
            </motion.div>
          )}
          <motion.div
            key="total"
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={SPRING_GENTLE}
            className="flex-1"
          >
            <BalancePill
              label="Total"
              value={total}
              color="text-text"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function BalancePill({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-surface-strong p-2.5 text-center">
      <p className="text-[9px] font-medium text-text-secondary uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className={`text-base font-bold ${color}`}>{formatCurrency(value)}</p>
    </div>
  );
}