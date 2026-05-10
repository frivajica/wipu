"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toggle } from "@/components/ui/toggle";
import { HelpCircle } from "lucide-react";
import { SPRING_DEFAULT } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface ReorderToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ReorderToggle({ checked, onChange }: ReorderToggleProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <div className="flex items-center gap-2">
      <Toggle
        checked={checked}
        onChange={onChange}
        label="Reorder by Date"
      />
      <div className="relative">
        <button
          type="button"
          className={cn(
            "text-text-tertiary hover:text-text-secondary transition-colors",
            "focus-visible:outline-none focus-visible:shadow-glow-focus rounded-lg cursor-pointer"
          )}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          onClick={() => setShowTooltip((s) => !s)}
          aria-label="What is Reorder by Date?"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={SPRING_DEFAULT}
              className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-surface rounded-xl border border-border/60 shadow-elevated text-xs text-text-secondary z-50"
            >
              When enabled, dragging items reorders them and updates their dates to match adjacent items.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
