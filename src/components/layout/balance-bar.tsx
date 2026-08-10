"use client";

import React from "react";

export function BalanceBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky top-15 z-20 -mx-4 px-4 py-2 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-2">
        {children}
      </div>
    </div>
  );
}
