"use client";

import * as React from "react";
import { useScrollTracking } from "@/hooks/shared/use-scroll-tracking";

interface ScrollTrackingContextValue {
  scrollTotal: number;
  currentPeriodKey: string | null;
  mouseY: number;
  activeItemId: string | null;
  observeElement: (
    el: HTMLElement,
    itemId: string,
    amount: number,
    type: string,
    periodKey: string,
    date: string
  ) => void;
  unobserveElement: (el: HTMLElement) => void;
  pause: () => void;
  resume: () => void;
  isSupported: boolean;
}

const ScrollTrackingContext = React.createContext<ScrollTrackingContextValue | null>(null);

export function useScrollTrackingContext(): ScrollTrackingContextValue {
  const ctx = React.useContext(ScrollTrackingContext);
  if (!ctx) {
    throw new Error(
      "useScrollTrackingContext must be used within ScrollTrackingProvider"
    );
  }
  return ctx;
}

interface ScrollTrackingProviderProps {
  items: Array<{ id: string; amount: number; type: string; date: string }>;
  initialTotal: number;
  children: React.ReactNode;
}

export function ScrollTrackingProvider({
  items,
  initialTotal,
  children,
}: ScrollTrackingProviderProps) {
  const tracking = useScrollTracking({ items, initialTotal });

  return (
    <ScrollTrackingContext.Provider value={tracking}>
      {children}
    </ScrollTrackingContext.Provider>
  );
}
