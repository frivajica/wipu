"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useClickOutside } from "@/hooks/shared/use-click-outside";
import { SPRING_DEFAULT } from "@/lib/animations";

type GroupOption = { id: string; label: string; type: "default" | "debt" };

interface GroupSelectorProps {
  value: string;
  onChange: (value: string, type: "default" | "debt") => void;
  options?: GroupOption[];
}

const defaultOptions: GroupOption[] = [
  { id: "default", label: "Default", type: "default" },
  { id: "debt-default", label: "General Debt", type: "debt" },
];

export function GroupSelector({
  value,
  onChange,
  options = defaultOptions,
}: GroupSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  const selected = options.find((o) => o.id === value) || options[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 h-10 px-3 rounded-lg text-sm font-medium",
          "border border-border/40 bg-surface hover:border-border-hover",
          "transition-colors duration-150",
          selected.type === "debt" && "text-debt border-debt/30 bg-debt-light/30"
        )}
      >
        <span className="w-2 h-2 rounded-full bg-current opacity-60" />
        {selected.label}
        <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={SPRING_DEFAULT}
            className={cn(
              "absolute z-50 mt-1.5 min-w-[160px] rounded-xl",
              "bg-surface border border-border/60 shadow-dropdown",
              "p-1.5 space-y-0.5"
            )}
          >
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(option.id, option.type);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm",
                  "transition-colors duration-150",
                  value === option.id
                    ? "bg-primary-accent/8 text-primary-accent font-medium"
                    : "hover:bg-surface-strong text-text-secondary"
                )}
              >
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    option.type === "debt" ? "bg-debt" : "bg-border-hover"
                  )}
                />
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
