"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useClickOutside } from "@/hooks/shared/use-click-outside";
import { SPRING_DEFAULT } from "@/lib/animations";

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  align?: "left" | "right";
}

export function Dropdown({
  trigger,
  children,
  isOpen,
  onClose,
  className,
  align = "left",
}: DropdownProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose);

  return (
    <div ref={ref} className="relative">
      {trigger}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={onClose} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={SPRING_DEFAULT}
              className={cn(
                "absolute top-full mt-2 bg-surface rounded-2xl z-50 overflow-hidden",
                // Warm elevated shadow
                "shadow-elevated border border-border/60",
                "py-1.5",
                align === "right" ? "right-0" : "left-0",
                className
              )}
            >
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
