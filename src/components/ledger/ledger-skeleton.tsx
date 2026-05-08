"use client";

import { SkeletonPulse } from "@/components/ui/skeleton-pulse";

export function LedgerSkeleton() {
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <SkeletonPulse className="h-8 w-48" />
        <SkeletonPulse className="h-10 w-32 rounded-xl" />
      </div>

      {[1, 2].map((group) => (
        <div key={group} className="space-y-2">
          <div className="flex items-end justify-between px-1 mb-4">
            <SkeletonPulse className="h-7 w-32" />
            <SkeletonPulse className="h-7 w-24" />
          </div>

          <div className="hidden md:grid grid-cols-[32px_120px_1fr_1fr_100px_80px] gap-4 px-4 pb-2">
            <div />
            <SkeletonPulse className="h-4 w-16" />
            <SkeletonPulse className="h-4 w-24" />
            <SkeletonPulse className="h-4 w-24" />
            <SkeletonPulse className="h-4 w-12" />
            <div />
          </div>

          {[1, 2, 3].map((row) => (
            <div
              key={row}
              className="grid md:grid-cols-[32px_120px_1fr_1fr_100px_80px] md:gap-4 grid-cols-[32px_1fr] gap-3 px-4 py-3 items-center rounded-xl bg-surface border border-border/40 shadow-card"
            >
              <SkeletonPulse className="h-5 w-5 rounded" />
              <SkeletonPulse className="h-5 w-20" />
              <SkeletonPulse className="h-4 w-full md:block hidden" />
              <SkeletonPulse className="h-4 w-20 md:block hidden" />
              <SkeletonPulse className="h-4 w-16 md:block hidden" />
              <SkeletonPulse className="h-6 w-6 rounded-full md:block hidden" />
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
