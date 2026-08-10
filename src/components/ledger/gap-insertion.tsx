"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { formatDateFull } from "@/lib/formatting";
import { SPRING_DEFAULT } from "@/lib/animations";

interface GapInsertionProps {
  y: number | null;
  date: string | null;
  isActive: boolean;
}

export function GapInsertion({ y, date, isActive }: GapInsertionProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || y === null || !date || !isActive) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="gap-insertion"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 48, opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={SPRING_DEFAULT}
        className="fixed left-0 right-0 z-40 pointer-events-none overflow-hidden"
        style={{ top: y }}
      >
        <div className="mx-auto max-w-2xl px-4 pt-2">
          <div className="flex items-center justify-center gap-3">
            <div className="flex-1 h-px bg-primary-accent/30" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05, ...SPRING_DEFAULT }}
              className="rounded-full bg-primary-accent/20 border border-primary-accent/30 px-3 py-1 text-xs font-medium text-primary-accent whitespace-nowrap"
            >
              {formatDateFull(date)}
            </motion.div>
            <div className="flex-1 h-px bg-primary-accent/30" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
