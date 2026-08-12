"use client";

import { SkeletonPulse } from "@/components/ui/skeleton-pulse";

export function RecurringSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-surface border border-border/40 shadow-card p-4"
        >
          <div className="flex items-center justify-between gap-4">
            <SkeletonPulse className="h-5 w-32" />
            <SkeletonPulse className="h-5 w-16" />
          </div>
          <SkeletonPulse className="h-4 w-2/3 mt-3" />
        </div>
      ))}
    </div>
  );
}
