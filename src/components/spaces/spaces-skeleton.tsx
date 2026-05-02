"use client";

import { SkeletonPulse } from "@/components/ui/skeleton-pulse";

export function SpacesSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-surface rounded-xl border border-border p-6 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 w-full">
              <SkeletonPulse className="h-6 w-32" />
              <div className="flex items-center gap-2">
                <SkeletonPulse className="h-4 w-4 rounded-full" />
                <SkeletonPulse className="h-4 w-24" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SkeletonPulse className="h-8 w-20" />
            <SkeletonPulse className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
