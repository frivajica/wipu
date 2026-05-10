"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatting";
import { SPRING_DEFAULT } from "@/lib/animations";

interface PeriodHeaderProps {
  label: string;
  balance: number;
  debt: number;
  runningBalance: number;
  runningDebt: number;
  includesDebt: boolean;
}

export function PeriodHeader({
  label,
  balance,
  debt,
  runningBalance,
  runningDebt,
  includesDebt,
}: PeriodHeaderProps) {
  const hasDebt = debt !== 0;
  const total = includesDebt ? runningBalance + runningDebt : runningBalance;

  return (
    <div className="mb-3 px-1">
      <h3 className="text-xl font-bold font-display text-text-primary tracking-tight mb-2">
        {label}
      </h3>
      <div className="flex justify-end gap-2">
        <AnimatePresence mode="popLayout">
          {hasDebt && includesDebt && (
            <motion.div
              key="debt-pill"
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={SPRING_DEFAULT}
            >
              <HoverPill
                label="Debt"
                value={runningDebt}
                color="text-debt"
                periodValue={debt}
              />
            </motion.div>
          )}
          <motion.div
            key="total-pill"
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={SPRING_DEFAULT}
          >
            <HoverPill
              label="Total"
              value={total}
              color="text-text"
              periodValue={includesDebt ? balance + debt : balance}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function HoverPill({
  label,
  value,
  color,
  periodValue,
}: {
  label: string;
  value: number;
  color: string;
  periodValue: number;
}) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="rounded-lg bg-surface-strong px-2.5 py-1.5 text-center cursor-default">
        <p className="text-[9px] font-semibold text-text-tertiary uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className={cn("text-sm font-bold tabular-nums", color)}>
          {formatCurrency(value)}
        </p>
      </div>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={SPRING_DEFAULT}
            className={cn(
              "absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50",
              "min-w-[180px] rounded-xl bg-surface-elevated",
              "border border-border/60 shadow-elevated",
              "px-3 py-2.5 space-y-2"
            )}
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Period</span>
              <span className={cn("font-semibold tabular-nums", color)}>
                {formatCurrency(periodValue)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Cumulative</span>
              <span className={cn("font-semibold tabular-nums", color)}>
                {formatCurrency(value)}
              </span>
            </div>
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-surface-elevated border-l border-t border-border/60 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
