"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { formatDateFull } from "@/lib/formatting";
import { SPRING_DEFAULT } from "@/lib/animations";

interface DatePreviewPillProps {
  date: string | null;
  y: number | null;
}

export function DatePreviewPill({ date, y }: DatePreviewPillProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !date || y === null) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="date-pill"
        initial={{ opacity: 0, scale: 0.8, y: y - 16 }}
        animate={{ opacity: 1, scale: 1, y: y - 16 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={SPRING_DEFAULT}
        className="fixed left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        style={{ top: y - 16 }}
      >
        <div className="rounded-full bg-primary-accent/20 border border-primary-accent/30 px-3 py-1 text-xs font-medium text-primary-accent shadow-lg backdrop-blur-sm whitespace-nowrap">
          {formatDateFull(date)}
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
