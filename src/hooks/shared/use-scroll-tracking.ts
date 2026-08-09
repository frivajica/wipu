"use client";

import * as React from "react";

interface TrackedElement {
  el: HTMLElement;
  itemId: string;
  amount: number;
  type: string;
  periodKey: string;
}

interface CumulativeEntry {
  itemId: string;
  runningTotal: number;
  periodKey: string;
  el: HTMLElement;
}

interface UseScrollTrackingOptions {
  items: Array<{ id: string; amount: number; type: string }>;
  includesDebt: boolean;
  initialTotal: number;
}

interface UseScrollTrackingReturn {
  scrollTotal: number;
  currentPeriodKey: string | null;
  mouseY: number;
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
  const [mouseY, setMouseY] = React.useState(-1);

  const trackedElements = React.useRef(new Map<HTMLElement, TrackedElement>());
  const cumulativeArray = React.useRef<CumulativeEntry[]>([]);
  const runningTotalRef = React.useRef(initialTotal);
  const frameRef = React.useRef<number | null>(null);
  const isPausedRef = React.useRef(false);
  const isSupportedRef = React.useRef(false);
  const includesDebtRef = React.useRef(includesDebt);
  const containerRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    includesDebtRef.current = includesDebt;
  }, [includesDebt]);

  React.useEffect(() => {
    runningTotalRef.current = initialTotal;
    setScrollTotal(initialTotal);
  }, [initialTotal]);

  const rebuildCumulativeArray = React.useCallback(() => {
    const entries: CumulativeEntry[] = [];
    let running = 0;

    const sorted = Array.from(trackedElements.current.values()).sort((a, b) => {
      const rectA = a.el.getBoundingClientRect();
      const rectB = b.el.getBoundingClientRect();
      return rectA.top - rectB.top;
    });

    for (const item of sorted) {
      const includeAmount = includesDebtRef.current || item.type !== "debt";
      if (includeAmount) {
        running += item.amount;
      }
      entries.push({
        itemId: item.itemId,
        runningTotal: running,
        periodKey: item.periodKey,
        el: item.el,
      });
    }

    cumulativeArray.current = entries;
    runningTotalRef.current = running;
  }, []);

  const computeFromCursor = React.useCallback((y: number) => {
    if (isPausedRef.current || cumulativeArray.current.length === 0) {
      setMouseY(y);
      return;
    }

    const el = document.elementFromPoint(
      window.innerWidth / 2,
      y
    ) as HTMLElement | null;

    if (!el) {
      setMouseY(y);
      return;
    }

    let trackedEl: HTMLElement | null = el;
    while (trackedEl && !trackedElements.current.has(trackedEl)) {
      trackedEl = trackedEl.parentElement;
    }

    if (!trackedEl) {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight / 2) {
        const last = cumulativeArray.current[cumulativeArray.current.length - 1];
        if (last) {
          setScrollTotal(last.runningTotal);
          setCurrentPeriodKey(last.periodKey);
        }
      } else {
        setScrollTotal(runningTotalRef.current);
        setCurrentPeriodKey(null);
      }
      setMouseY(y);
      return;
    }

    const idx = cumulativeArray.current.findIndex(
      (e) => e.el === trackedEl
    );

    if (idx >= 0) {
      const entry = cumulativeArray.current[idx];
      setScrollTotal(entry.runningTotal);
      setCurrentPeriodKey(entry.periodKey);
    }

    setMouseY(y);
  }, []);

  React.useEffect(() => {
    const hasEFP = typeof document.elementFromPoint !== "undefined";
    const hasRAF = typeof requestAnimationFrame !== "undefined";
    isSupportedRef.current = hasEFP && hasRAF;
  }, []);

  React.useEffect(() => {
    if (!isSupportedRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!frameRef.current) {
        frameRef.current = requestAnimationFrame(() => {
          computeFromCursor(e.clientY);
          frameRef.current = null;
        });
      }
    };

    try {
      document.addEventListener("mousemove", handleMouseMove);
    } catch {
      isSupportedRef.current = false;
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [computeFromCursor]);

  const observeElement = React.useCallback(
    (
      el: HTMLElement,
      itemId: string,
      amount: number,
      type: string,
      periodKey: string
    ) => {
      if (!isSupportedRef.current) return;

      trackedElements.current.set(el, {
        el,
        itemId,
        amount,
        type,
        periodKey,
      });

      try {
        rebuildCumulativeArray();
      } catch {
        isSupportedRef.current = false;
      }
    },
    [rebuildCumulativeArray]
  );

  const unobserveElement = React.useCallback((el: HTMLElement) => {
    if (!isSupportedRef.current) return;

    trackedElements.current.delete(el);

    try {
      rebuildCumulativeArray();
    } catch {
      // ignore
    }
  }, [rebuildCumulativeArray]);

  const pause = React.useCallback(() => {
    isPausedRef.current = true;
  }, []);

  const resume = React.useCallback(() => {
    isPausedRef.current = false;
    rebuildCumulativeArray();
  }, [rebuildCumulativeArray]);

  React.useEffect(() => {
    if (!isSupportedRef.current) return;

    const itemAmounts = new Map(items.map((i) => [i.id, i]));
    let changed = false;
    for (const [el, tracked] of trackedElements.current) {
      const current = itemAmounts.get(tracked.itemId);
      if (current && current.amount !== tracked.amount) {
        trackedElements.current.set(el, {
          ...tracked,
          amount: current.amount,
          type: current.type,
        });
        changed = true;
      }
    }
    if (changed) {
      rebuildCumulativeArray();
    }
  }, [items, rebuildCumulativeArray]);

  return {
    scrollTotal,
    currentPeriodKey,
    mouseY,
    observeElement,
    unobserveElement,
    pause,
    resume,
    isSupported: isSupportedRef.current,
  };
}
