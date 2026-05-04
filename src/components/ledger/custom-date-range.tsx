"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CustomDateRangeProps {
  start: string;
  end: string;
  onChange: (range: { start: string; end: string }) => void;
  className?: string;
}

export function CustomDateRange({ start, end, onChange, className }: CustomDateRangeProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        type="date"
        value={start}
        onChange={(e) => onChange({ start: e.target.value, end })}
        className={cn(
          "h-10 px-3 rounded-lg border border-border bg-surface-warm text-sm",
          "transition-all duration-200 ease-out",
          "hover:border-border-hover",
          "focus-visible:outline-none focus-visible:border-primary-accent focus-visible:shadow-glow-focus focus-visible:bg-surface"
        )}
      />
      <span className="text-text-tertiary text-sm font-medium">to</span>
      <input
        type="date"
        value={end}
        onChange={(e) => onChange({ start, end: e.target.value })}
        className={cn(
          "h-10 px-3 rounded-lg border border-border bg-surface-warm text-sm",
          "transition-all duration-200 ease-out",
          "hover:border-border-hover",
          "focus-visible:outline-none focus-visible:border-primary-accent focus-visible:shadow-glow-focus focus-visible:bg-surface"
        )}
      />
    </div>
  );
}
