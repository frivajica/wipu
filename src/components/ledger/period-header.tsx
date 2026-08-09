"use client";

import { formatCurrency } from "@/lib/formatting";

interface PeriodHeaderProps {
  label: string;
  balance: number;
  debt: number;
  runningBalance: number;
  runningDebt: number;
  includesDebt: boolean;
  isActive?: boolean;
}

export function PeriodHeader({
  label,
  balance,
  debt,
  runningBalance,
  runningDebt,
  includesDebt,
  isActive,
}: PeriodHeaderProps) {
  const periodTotal = includesDebt ? balance + debt : balance;
  const cumulativeTotal = includesDebt ? runningBalance : runningBalance - runningDebt;

  return (
    <div className="mb-3 px-1">
      <h3 className={`text-xl font-bold font-display tracking-tight mb-2 transition-colors duration-150 ${
        isActive ? "text-primary-accent" : "text-text-primary"
      }`}>
        {label}
      </h3>
      <div className="flex items-center justify-between gap-4 rounded-lg bg-surface-strong px-3 py-2">
        <div>
          <p className="text-[9px] font-semibold text-text-tertiary uppercase tracking-wider mb-0.5">
            Period
          </p>
          <p className="text-sm font-bold tabular-nums text-text">
            {formatCurrency(periodTotal)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-semibold text-text-tertiary uppercase tracking-wider mb-0.5">
            Cumulative Total
          </p>
          <p className="text-sm font-bold tabular-nums text-text">
            {formatCurrency(cumulativeTotal)}
          </p>
        </div>
      </div>
    </div>
  );
}