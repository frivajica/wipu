"use client";

import * as React from "react";
import { DateTime } from "luxon";

interface TrackedElement {
  el: HTMLElement;
  itemId: string;
  amount: number;
  type: string;
  periodKey: string;
  date: string;
}

interface ChronologicalEntry {
  itemId: string;
  runningTotal: number;
  periodKey: string;
}

interface UseScrollTrackingOptions {
  items: Array<{ id: string; amount: number; type: string; date: string }>;
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
    periodKey: string,
    date: string
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
  const chronologicalMap = React.useRef(new Map<string, ChronologicalEntry>());
  const runningTotalRef = React.useRef(initialTotal);
  const frameRef = React.useRef<number | null>(null);
  const [isSupported] = React.useState(() => {
    const supported = typeof document.elementFromPoint !== "undefined" &&
      typeof requestAnimationFrame !== "undefined";
    isSupportedRef.current = supported;
    return supported;
  });
  const isPausedRef = React.useRef(false);
  const includesDebtRef = React.useRef(includesDebt);

  React.useEffect(() => {
    includesDebtRef.current = includesDebt;
  }, [includesDebt]);

  const buildChronologicalMap = React.useCallback(() => {
    const allItems = Array.from(trackedElements.current.values());

    const sorted = allItems.sort((a, b) => {
      return DateTime.fromISO(a.date).toMillis() - DateTime.fromISO(b.date).toMillis();
    });

    const map = new Map<string, ChronologicalEntry>();
    let running = 0;

    for (const item of sorted) {
      const includeAmount = includesDebtRef.current || item.type !== "debt";
      if (includeAmount) {
        running += item.amount;
      }
      map.set(item.itemId, {
        itemId: item.itemId,
        runningTotal: running,
        periodKey: item.periodKey,
      });
    }

    const visibleTotal = running;
    const offset = initialTotal - visibleTotal;

    for (const [itemId, entry] of map) {
      map.set(itemId, {
        ...entry,
        runningTotal: entry.runningTotal + offset,
      });
    }

    chronologicalMap.current = map;
    runningTotalRef.current = initialTotal;
  }, [initialTotal]);

  const computeFromCursor = React.useCallback((y: number) => {
    if (isPausedRef.current) {
      setMouseY(y);
      return;
    }

    const cx = window.innerWidth / 2;
    const elements = document.elementsFromPoint(cx, y);

    let found: TrackedElement | null = null;
    for (const el of elements) {
      const tracked = trackedElements.current.get(el as HTMLElement);
      if (tracked) {
        found = tracked;
        break;
      }
    }

    if (!found) {
      let minGap = Infinity;
      for (const item of trackedElements.current.values()) {
        const rect = item.el.getBoundingClientRect();
        if (rect.top >= y && rect.top - y < minGap) {
          minGap = rect.top - y;
          found = item;
        }
      }
    }

    if (found) {
      const entry = chronologicalMap.current.get(found.itemId);
      if (entry) {
        setScrollTotal(entry.runningTotal);
        setCurrentPeriodKey(entry.periodKey);
      }
    } else {
      const last = Array.from(chronologicalMap.current.values()).pop();
      if (last) {
        setScrollTotal(last.runningTotal);
        setCurrentPeriodKey(last.periodKey);
      } else {
        setScrollTotal(runningTotalRef.current);
        setCurrentPeriodKey(null);
      }
    }

    setMouseY(y);
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
      // ignore
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
      periodKey: string,
      date: string
    ) => {
      if (!isSupportedRef.current) return;

      trackedElements.current.set(el, {
        el,
        itemId,
        amount,
        type,
        periodKey,
        date,
      });

      try {
        buildChronologicalMap();
      } catch {
        // ignore
      }
    },
    [buildChronologicalMap]
  );

  const unobserveElement = React.useCallback((el: HTMLElement) => {
    if (!isSupportedRef.current) return;

    trackedElements.current.delete(el);

    try {
      buildChronologicalMap();
    } catch {
      // ignore
    }
  }, [buildChronologicalMap]);

  const pause = React.useCallback(() => {
    isPausedRef.current = true;
  }, []);

  const resume = React.useCallback(() => {
    isPausedRef.current = false;
    buildChronologicalMap();
  }, [buildChronologicalMap]);

  React.useEffect(() => {
    if (!isSupportedRef.current) return;

    const itemAmounts = new Map(items.map((i) => [i.id, i]));
    let changed = false;
    for (const [el, tracked] of trackedElements.current) {
      const current = itemAmounts.get(tracked.itemId);
      if (current && (current.amount !== tracked.amount || current.type !== tracked.type || current.date !== tracked.date)) {
        trackedElements.current.set(el, {
          ...tracked,
          amount: current.amount,
          type: current.type,
          date: current.date,
        });
        changed = true;
      }
    }
    if (changed) {
      buildChronologicalMap();
    }
  }, [items, buildChronologicalMap]);

  return {
    scrollTotal,
    currentPeriodKey,
    mouseY,
    observeElement,
    unobserveElement,
    pause,
    resume,
    isSupported,
  };
}
