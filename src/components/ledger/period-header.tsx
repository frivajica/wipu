"use client";

import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-number";

interface PeriodHeaderProps {
  label: string;
  balance: number;
}

export function PeriodHeader({ label, balance }: PeriodHeaderProps) {
  const isPositive = balance >= 0;

  return (
    <div className="flex items-end justify-between mb-4 px-1">
      <h3 className="text-xl font-bold font-display text-text-primary tracking-tight">
        {label}
      </h3>
      <div className="text-right">
        <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider block mb-1">
          Period Balance
        </span>
        <span
          className={cn(
            "text-xl font-bold font-display tabular-nums tracking-tight",
            isPositive ? "text-secondary" : "text-error"
          )}
        >
          <AnimatedNumber
            value={balance}
            prefix={isPositive ? "+" : ""}
            className={isPositive ? "text-secondary" : "text-error"}
          />
        </span>
      </div>
    </div>
  );
}
