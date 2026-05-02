"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function Toggle({ checked, onChange, label, className }: ToggleProps) {
  return (
    <label
      className={cn(
        "inline-flex items-center gap-3 cursor-pointer select-none",
        className
      )}
    >
      {label && (
        <span className="text-sm font-medium text-text-primary">{label}</span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent focus-visible:ring-offset-2",
          checked ? "bg-primary-accent" : "bg-border"
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm",
            "will-change-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
          style={{
            transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
      </button>
    </label>
  );
}
