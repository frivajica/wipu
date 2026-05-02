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
    <div className="flex items-end justify-between mb-3 px-2">
      <h3 className="text-lg font-semibold font-display text-text-primary">
        {label}
      </h3>
      <div className="text-right">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wider block mb-0.5">
          Period Balance
        </span>
        <span
          className={cn(
            "text-lg font-semibold font-display",
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
