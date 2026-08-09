"use client";

import * as React from "react";

interface TrackedElement {
  el: HTMLElement;
  itemId: string;
  amount: number;
  type: string;
  periodKey: string;
}

interface UseScrollTrackingOptions {
  items: Array<{ id: string; amount: number; type: string }>;
  includesDebt: boolean;
  initialTotal: number;
}

interface UseScrollTrackingReturn {
  scrollTotal: number;
  currentPeriodKey: string | null;
  observeElement: (
    el: HTMLElement,
    itemId: string,
    amount: number,
    type: string,
    periodKey: string
  ) => void;
  unobserveElement: (el: HTMLElement) => void;
  pause: () => void;
  resume: () => void;
  isSupported: boolean;
}

export function useScrollTracking({
  items,
  includesDebt,
  initialTotal,
}: UseScrollTrackingOptions): UseScrollTrackingReturn {
  const [scrollTotal, setScrollTotal] = React.useState(initialTotal);
  const [currentPeriodKey, setCurrentPeriodKey] = React.useState<string | null>(null);

  const itemsAboveLine = React.useRef(new Set<string>());
  const trackedElements = React.useRef(new Map<HTMLElement, TrackedElement>());
  const runningTotalRef = React.useRef(initialTotal);
  const frameRef = React.useRef<number | null>(null);
  const isPausedRef = React.useRef(false);
  const isSupportedRef = React.useRef(false);
  const observerRef = React.useRef<IntersectionObserver | null>(null);
  const includesDebtRef = React.useRef(includesDebt);

  React.useEffect(() => {
    includesDebtRef.current = includesDebt;
  }, [includesDebt]);

  React.useEffect(() => {
    runningTotalRef.current = initialTotal;
    setScrollTotal(initialTotal);
  }, [initialTotal]);

  React.useEffect(() => {
    const hasIO = typeof IntersectionObserver !== "undefined";
    const hasRAF = typeof requestAnimationFrame !== "undefined";
    isSupportedRef.current = hasIO && hasRAF;

    if (!hasIO || !hasRAF) return;

    try {
      const observer = new IntersectionObserver(
        (entries) => {
          if (isPausedRef.current) return;

          for (const entry of entries) {
            const el = entry.target as HTMLElement;
            const tracked = trackedElements.current.get(el);
            if (!tracked) continue;

            const includeAmount =
              includesDebtRef.current || tracked.type !== "debt";
            const amountDelta = includeAmount ? tracked.amount : 0;

            if (entry.isIntersecting) {
              if (!itemsAboveLine.current.has(tracked.itemId)) {
                itemsAboveLine.current.add(tracked.itemId);
                runningTotalRef.current += amountDelta;
              }
            } else {
              if (itemsAboveLine.current.has(tracked.itemId)) {
                itemsAboveLine.current.delete(tracked.itemId);
                runningTotalRef.current -= amountDelta;
              }
            }
          }

          if (!frameRef.current) {
            frameRef.current = requestAnimationFrame(() => {
              setScrollTotal(runningTotalRef.current);

              let latestPeriodKey: string | null = null;
              let lowestY = -Infinity;
              for (const [el, tracked] of trackedElements.current) {
                if (itemsAboveLine.current.has(tracked.itemId)) {
                  const rect = el.getBoundingClientRect();
                  if (rect.bottom > lowestY) {
                    lowestY = rect.bottom;
                    latestPeriodKey = tracked.periodKey;
                  }
                }
              }
              setCurrentPeriodKey(latestPeriodKey);
              frameRef.current = null;
            });
          }
        },
        {
          rootMargin: "-60px 0px 0px 0px",
          threshold: 0,
        }
      );

      observerRef.current = observer;
    } catch {
      isSupportedRef.current = false;
      observerRef.current = null;
    }

    return () => {
      observerRef.current?.disconnect();
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, []);

  const observeElement = React.useCallback(
    (
      el: HTMLElement,
      itemId: string,
      amount: number,
      type: string,
      periodKey: string
    ) => {
      if (!isSupportedRef.current || !observerRef.current) return;

      trackedElements.current.set(el, {
        el,
        itemId,
        amount,
        type,
        periodKey,
      });

      try {
        observerRef.current.observe(el);
      } catch {
        isSupportedRef.current = false;
      }
    },
    []
  );

  const unobserveElement = React.useCallback((el: HTMLElement) => {
    if (!isSupportedRef.current || !observerRef.current) return;

    const tracked = trackedElements.current.get(el);
    if (tracked && itemsAboveLine.current.has(tracked.itemId)) {
      const includeAmount = includesDebtRef.current || tracked.type !== "debt";
      if (includeAmount) {
        runningTotalRef.current -= tracked.amount;
      }
      itemsAboveLine.current.delete(tracked.itemId);
    }

    try {
      observerRef.current.unobserve(el);
    } catch {
      // ignore
    }
    trackedElements.current.delete(el);
  }, []);

  const pause = React.useCallback(() => {
    isPausedRef.current = true;
    observerRef.current?.disconnect();
  }, []);

  const resume = React.useCallback(() => {
    isPausedRef.current = false;
    if (observerRef.current) {
      for (const { el } of trackedElements.current.values()) {
        try {
          observerRef.current.observe(el);
        } catch {
          // ignore
        }
      }
    }
  }, []);

  React.useEffect(() => {
    const itemAmounts = new Map(items.map((i) => [i.id, i]));
    for (const [el, tracked] of trackedElements.current) {
      const current = itemAmounts.get(tracked.itemId);
      if (current && current.amount !== tracked.amount) {
        const wasAbove = itemsAboveLine.current.has(tracked.itemId);
        const includeAmount =
          includesDebtRef.current || tracked.type !== "debt";
        if (wasAbove && includeAmount) {
          runningTotalRef.current -= tracked.amount;
          runningTotalRef.current += current.amount;
        }
        trackedElements.current.set(el, {
          ...tracked,
          amount: current.amount,
          type: current.type,
        });
      }
    }
  }, [items]);

  return {
    scrollTotal,
    currentPeriodKey,
    observeElement,
    unobserveElement,
    pause,
    resume,
    isSupported: isSupportedRef.current,
  };
}
