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
  initialTotal: number;
}

interface UseScrollTrackingReturn {
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

export function useScrollTracking({
  items,
  initialTotal,
}: UseScrollTrackingOptions): UseScrollTrackingReturn {
  const [scrollTotal, setScrollTotal] = React.useState(initialTotal);
  const [currentPeriodKey, setCurrentPeriodKey] = React.useState<string | null>(null);
  const [mouseY, setMouseY] = React.useState(-1);
  const [activeItemId, setActiveItemId] = React.useState<string | null>(null);

  const trackedElements = React.useRef(new Map<HTMLElement, TrackedElement>());
  const chronologicalMap = React.useRef(new Map<string, ChronologicalEntry>());
  const runningTotalRef = React.useRef(initialTotal);
  const frameRef = React.useRef<number | null>(null);
  const isPausedRef = React.useRef(false);
  const lastCursorYRef = React.useRef<number>(-1);

  const isSupported = React.useMemo(() => {
    return typeof document.elementFromPoint !== "undefined" &&
      typeof requestAnimationFrame !== "undefined";
  }, []);

  const buildChronologicalMap = React.useCallback(() => {
    const allItems = Array.from(trackedElements.current.values());

    const sorted = allItems.sort((a, b) => {
      const dateDiff = DateTime.fromISO(a.date).toMillis() - DateTime.fromISO(b.date).toMillis();
      if (dateDiff !== 0) return dateDiff;
      const rectA = a.el.getBoundingClientRect();
      const rectB = b.el.getBoundingClientRect();
      return rectB.top - rectA.top;
    });

    const map = new Map<string, ChronologicalEntry>();
    let running = 0;

    for (const item of sorted) {
      running += item.amount;
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

    lastCursorYRef.current = y;

    let found: TrackedElement | null = null;

    for (const item of trackedElements.current.values()) {
      const rect = item.el.getBoundingClientRect();
      if (y >= rect.top && y <= rect.bottom) {
        found = item;
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

    setActiveItemId(found?.itemId ?? null);

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
    if (!isSupported) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!frameRef.current) {
        frameRef.current = requestAnimationFrame(() => {
          computeFromCursor(e.clientY);
          frameRef.current = null;
        });
      }
    };

    const handleScroll = () => {
      if (!frameRef.current && lastCursorYRef.current >= 0) {
        frameRef.current = requestAnimationFrame(() => {
          computeFromCursor(lastCursorYRef.current);
          frameRef.current = null;
        });
      }
    };

    try {
      document.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("scroll", handleScroll, { passive: true });
    } catch {
      // ignore
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [computeFromCursor, isSupported]);

  const observeElement = React.useCallback(
    (
      el: HTMLElement,
      itemId: string,
      amount: number,
      type: string,
      periodKey: string,
      date: string
    ) => {
      if (!isSupported) return;

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
    [buildChronologicalMap, isSupported]
  );

  const unobserveElement = React.useCallback((el: HTMLElement) => {
    if (!isSupported) return;

    trackedElements.current.delete(el);

    try {
      buildChronologicalMap();
    } catch {
      // ignore
    }
  }, [buildChronologicalMap, isSupported]);

  const pause = React.useCallback(() => {
    isPausedRef.current = true;
  }, []);

  const resume = React.useCallback(() => {
    isPausedRef.current = false;
    buildChronologicalMap();
  }, [buildChronologicalMap]);

  React.useEffect(() => {
    if (!isSupported) return;

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
  }, [items, buildChronologicalMap, isSupported]);

  return {
    scrollTotal,
    currentPeriodKey,
    mouseY,
    activeItemId,
    observeElement,
    unobserveElement,
    pause,
    resume,
    isSupported,
  };
}
