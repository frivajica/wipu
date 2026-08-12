"use client";

import { SkeletonPulse } from "@/components/ui/skeleton-pulse";

export function DebtSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-surface border border-border/40 shadow-card p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <SkeletonPulse className="h-6 w-40" />
            <SkeletonPulse className="h-5 w-20" />
          </div>
          <div className="space-y-2">
            <SkeletonPulse className="h-8 w-full" />
            <SkeletonPulse className="h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
