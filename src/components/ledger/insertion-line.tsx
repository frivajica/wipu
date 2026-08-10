"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SPRING_DEFAULT } from "@/lib/animations";

interface InsertionLineProps {
  y: number | null;
}

export function InsertionLine({ y }: InsertionLineProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || y === null) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="insertion-line"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        exit={{ opacity: 0, scaleX: 0 }}
        transition={{ ...SPRING_DEFAULT, scaleX: { duration: 0.15 } }}
        className="fixed left-0 right-0 z-40 pointer-events-none"
        style={{ top: y }}
      >
        <div className="mx-auto max-w-2xl px-4">
          <div className="h-px border-t-2 border-dashed border-primary-accent/50" />
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
