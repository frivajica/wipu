"use client";

import { useScrollTrackingContext } from "@/contexts/scroll-tracking-context";

export function CursorLine() {
  const { mouseY, isSupported } = useScrollTrackingContext();

  if (!isSupported || mouseY < 0) return null;

  return (
    <div
      className="fixed left-0 right-0 z-10 pointer-events-none"
      style={{
        top: mouseY,
        borderTop: "1px dashed rgba(212, 208, 203, 0.6)",
      }}
    />
  );
}
