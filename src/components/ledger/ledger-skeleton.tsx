"use client";

import { SkeletonPulse } from "@/components/ui/skeleton-pulse";

export function LedgerSkeleton() {
  return (
    <div className="space-y-10">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <SkeletonPulse className="h-8 w-48" />
        <SkeletonPulse className="h-10 w-32 rounded-xl" />
      </div>

      {/* Period groups */}
      {[1, 2].map((group) => (
        <div key={group} className="space-y-2">
          {/* Period header */}
          <div className="flex items-end justify-between px-1 mb-4">
            <SkeletonPulse className="h-7 w-32" />
            <SkeletonPulse className="h-7 w-24" />
          </div>

          {/* Desktop column headers */}
          <div className="hidden md:grid grid-cols-[32px_120px_1fr_120px_100px_60px] gap-4 px-4 pb-2">
            <div />
            <SkeletonPulse className="h-4 w-16" />
            <SkeletonPulse className="h-4 w-24" />
            <SkeletonPulse className="h-4 w-16" />
            <SkeletonPulse className="h-4 w-12" />
            <div />
          </div>

          {/* Rows — individual card skeletons */}
          {[1, 2, 3].map((row) => (
            <div
              key={row}
              className="grid md:grid-cols-[32px_120px_1fr_120px_100px_60px] md:gap-4 grid-cols-[32px_1fr] gap-3 px-4 py-3 items-center rounded-xl bg-surface border border-border/40 shadow-card"
            >
              <SkeletonPulse className="h-5 w-5 rounded" />
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
                  <SkeletonPulse className="h-4 w-16 rounded-full" />
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
