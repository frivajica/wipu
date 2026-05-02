"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SortResetCueProps {
  visible: boolean;
  onReset: () => void;
}

export function SortResetCue({ visible, onReset }: SortResetCueProps) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        "mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200",
        "flex items-center justify-between animate-in slide-in-from-top-2"
      )}
    >
      <p className="text-sm text-amber-800">
        Sorting by date. Drag & drop is disabled.
      </p>
      <button
        onClick={onReset}
        className="text-sm font-medium text-amber-900 hover:text-amber-700 underline"
      >
        Reset sort
      </button>
    </div>
  );
}
