"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
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
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium w-full sm:w-auto cursor-pointer",
            "bg-surface border border-border hover:border-primary-accent transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent focus-visible:ring-offset-2"
          )}
      >
        {selectedLabel}
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute left-0 top-full mt-1 w-full sm:w-40 bg-surface rounded-lg border border-border shadow-lg py-1 z-50 overflow-hidden"
            >
              {PERIOD_TYPES.map((period, index) => (
                <motion.button
                  key={period.value}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => {
                    onChange(period.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer",
                    period.value === value
                      ? "bg-primary-accent/10 text-primary-accent"
                      : "text-text-primary hover:bg-surface-elevated"
                  )}
                >
                  {period.label}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
