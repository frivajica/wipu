"use client";

import { useScrollTrackingContext } from "@/contexts/scroll-tracking-context";
import { useUIStore } from "@/stores/ui-store";

export function CursorLine() {
  const { mouseY, isSupported } = useScrollTrackingContext();
  const sortField = useUIStore((s) => s.sortField);
  const sortDirection = useUIStore((s) => s.sortDirection);

  const isActiveDateSort = sortField === "date" && sortDirection === "desc";

  if (!isSupported || !isActiveDateSort || mouseY < 0) return null;

  return (
    <div
      className="fixed left-0 right-0 z-[20] pointer-events-none"
      style={{
        top: mouseY,
        borderTop: "1px dashed rgba(212, 208, 203, 0.6)",
      }}
    />
  );
}
