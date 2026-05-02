"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toggle } from "@/components/ui/toggle";
import { HelpCircle } from "lucide-react";
import { SPRING_DEFAULT } from "@/lib/animations";

interface SmartDateToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function SmartDateToggle({ checked, onChange }: SmartDateToggleProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <div className="flex items-center gap-2">
      <Toggle
        checked={checked}
        onChange={onChange}
        label="Smart Date Inheritance"
      />
      <div className="relative">
        <button
          type="button"
          className="text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent focus-visible:ring-offset-2 rounded cursor-pointer"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          onClick={() => setShowTooltip((s) => !s)}
          aria-label="What is Smart Date Inheritance?"
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
              className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-surface rounded-lg border border-border shadow-lg text-xs text-text-secondary z-50"
            >
              When enabled, dragging items to reorder will automatically update their dates to match nearby items.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
