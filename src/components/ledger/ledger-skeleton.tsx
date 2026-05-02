"use client";

import { motion } from "framer-motion";

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div className={className}>
      <motion.div
        className="h-full w-full bg-surface-elevated rounded"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export function LedgerSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <SkeletonPulse className="h-8 w-48" />
        <SkeletonPulse className="h-10 w-32" />
      </div>

      {/* Period groups */}
      {[1, 2].map((group) => (
        <div key={group} className="space-y-3">
          {/* Period header */}
          <div className="flex items-end justify-between px-2">
            <SkeletonPulse className="h-6 w-32" />
            <SkeletonPulse className="h-6 w-24" />
          </div>

          {/* Desktop column headers */}
          <div className="hidden md:grid grid-cols-[32px_120px_1fr_120px_100px_60px] gap-4 px-4 py-2">
            <div />
            <SkeletonPulse className="h-4 w-16" />
            <SkeletonPulse className="h-4 w-24" />
            <SkeletonPulse className="h-4 w-16" />
            <SkeletonPulse className="h-4 w-12" />
            <div />
          </div>

          {/* Rows */}
          {[1, 2, 3].map((row) => (
            <div
              key={row}
              className="grid md:grid-cols-[32px_120px_1fr_120px_100px_60px] md:gap-4 grid-cols-[32px_1fr] gap-3 px-4 py-3 items-center"
            >
              <SkeletonPulse className="h-5 w-5" />
              <SkeletonPulse className="h-5 w-20" />
              <SkeletonPulse className="h-4 w-full md:block hidden" />
              <SkeletonPulse className="h-4 w-20 md:block hidden" />
              <SkeletonPulse className="h-4 w-16 md:block hidden" />
              <SkeletonPulse className="h-6 w-6 rounded-full md:block hidden" />
              {/* Mobile stacked layout */}
              <div className="md:hidden flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <SkeletonPulse className="h-5 w-20" />
                  <SkeletonPulse className="h-6 w-6 rounded-full" />
                </div>
                <SkeletonPulse className="h-4 w-full" />
                <div className="flex items-center gap-2">
                  <SkeletonPulse className="h-4 w-16" />
                  <SkeletonPulse className="h-4 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
