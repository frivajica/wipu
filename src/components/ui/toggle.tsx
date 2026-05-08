"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SPRING_SNAP } from "@/lib/animations";

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
          "relative inline-flex h-[26px] w-[46px] items-center shrink-0 cursor-pointer",
          "rounded-full transition-colors duration-200 ease-out",
          "focus-visible:outline-none focus-visible:shadow-glow-focus",
          checked
            ? "bg-primary-accent shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]"
            : "bg-surface-elevated border border-border shadow-inner-active"
        )}
      >
        <motion.span
          className={cn(
            "inline-block h-[22px] w-[22px] rounded-full will-change-transform",
            checked
              ? "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.15)]"
              : "bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
          )}
          initial={false}
          animate={{
            x: checked ? 21 : 2,
          }}
          transition={SPRING_SNAP}
        />
      </button>
    </label>
  );
}
