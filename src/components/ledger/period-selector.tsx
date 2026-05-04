"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PeriodType } from "@/lib/types";
import { PERIOD_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { SPRING_DEFAULT } from "@/lib/animations";

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
          "flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium w-full sm:w-auto cursor-pointer",
          "bg-surface border border-border/70 hover:border-primary-accent/40 hover:bg-surface-warm",
          "shadow-card hover:shadow-card-hover transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:shadow-glow-focus"
        )}
      >
        {selectedLabel}
        <ChevronDown className={cn("h-4 w-4 text-text-tertiary transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={SPRING_DEFAULT}
              className="absolute left-0 top-full mt-2 w-full sm:w-44 bg-surface rounded-2xl border border-border/60 shadow-elevated py-1.5 z-50 overflow-hidden"
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
                    "w-full text-left mx-1 w-[calc(100%-8px)] rounded-lg px-3 py-2 text-sm transition-all duration-150 cursor-pointer",
                    period.value === value
                      ? "bg-primary-accent/[0.08] text-primary-accent font-medium"
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
