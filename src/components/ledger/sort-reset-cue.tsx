"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SortResetCueProps {
  visible: boolean;
  onReset: () => void;
}

export function SortResetCue({ visible, onReset }: SortResetCueProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 35 }}
          className="overflow-hidden"
        >
          <div
            className={cn(
              "mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200",
              "flex items-center justify-between"
            )}
          >
            <p className="text-sm text-amber-800">
              Sorting by date. Drag & drop is disabled.
            </p>
            <button
              onClick={onReset}
              className="text-sm font-medium text-amber-900 hover:text-amber-700 underline cursor-pointer"
            >
              Reset sort
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
