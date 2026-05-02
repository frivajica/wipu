"use client";

import * as React from "react";
import { PeriodType } from "@/lib/types";
import { PERIOD_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface PeriodSelectorProps {
  value: PeriodType;
  onChange: (value: PeriodType) => void;
  className?: string;
}

export function PeriodSelector({ value, onChange, className }: PeriodSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedLabel = PERIOD_TYPES.find((p) => p.value === value)?.label;

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
          "bg-surface border border-border hover:border-primary-accent transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent focus-visible:ring-offset-2"
        )}
      >
        {selectedLabel}
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full mt-1 w-40 bg-surface rounded-lg border border-border shadow-lg py-1 z-50">
            {PERIOD_TYPES.map((period) => (
              <button
                key={period.value}
                onClick={() => {
                  onChange(period.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm transition-colors",
                  period.value === value
                    ? "bg-primary-accent/10 text-primary-accent"
                    : "text-text-primary hover:bg-surface-elevated"
                )}
              >
                {period.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
