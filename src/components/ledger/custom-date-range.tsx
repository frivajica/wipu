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
          "h-10 px-3 rounded-lg border border-border bg-surface text-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent focus-visible:ring-offset-2"
        )}
      />
      <span className="text-text-secondary">to</span>
      <input
        type="date"
        value={end}
        onChange={(e) => onChange({ start, end: e.target.value })}
        className={cn(
          "h-10 px-3 rounded-lg border border-border bg-surface text-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent focus-visible:ring-offset-2"
        )}
      />
    </div>
  );
}
