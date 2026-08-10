"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/lib/formatting";
import { SPRING_DEFAULT, SPRING_SNAP } from "@/lib/animations";

const GHOST_ROW_HEIGHT = 28;

interface GhostRowsProps {
  dates: string[];
  gapY: number;
  expandedHeight: number;
  pointerY: number;
  highlightedDate: string | null;
}

export function GhostRows({ dates, gapY, expandedHeight, pointerY, highlightedDate }: GhostRowsProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || dates.length === 0) return null;

  const rowHeight = GHOST_ROW_HEIGHT;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="ghost-rows"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: expandedHeight, opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={SPRING_DEFAULT}
        className="fixed left-0 right-0 z-30 pointer-events-none overflow-hidden"
        style={{ top: gapY }}
      >
        <div className="mx-auto max-w-2xl px-4">
          <div className="flex flex-col gap-1">
            <AnimatePresence>
              {dates.map((date, i) => {
                const isHighlighted = date === highlightedDate;

                return (
                  <motion.div
                    key={date}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{
                      opacity: isHighlighted ? 1 : 0.45,
                      x: 0,
                      scale: isHighlighted ? 1.01 : 1,
                    }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{
                      ...SPRING_SNAP,
                      delay: i * 0.02,
                    }}
                    className={`rounded-lg border transition-all duration-150 ${
                      isHighlighted
                        ? "bg-primary-accent/10 border-primary-accent/40 shadow-[0_0_0_1px_rgba(99,102,241,0.25)]"
                        : "bg-surface/40 border-border/15"
                    }`}
                    style={{
                      height: rowHeight - 4,
                    }}
                  >
                    <div className="flex items-center h-full px-3">
                      <div className="w-[18px]" />
                      <div className="w-[100px]" />
                      <div className="flex-1" />
                      <div className="flex-1" />
                      <div className="w-[90px] text-center">
                        <span className={`text-xs font-medium tabular-nums ${
                          isHighlighted ? "text-primary-accent" : "text-text-tertiary/50"
                        }`}>
                          {formatDate(date)}
                        </span>
                      </div>
                      <div className="w-[64px]" />
                      <div className="w-[18px]" />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
