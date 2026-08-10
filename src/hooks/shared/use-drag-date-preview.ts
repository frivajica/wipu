"use client";

import * as React from "react";
import { DateTime } from "luxon";
import { interpolateDate } from "@/lib/date-utils";
import { PeriodType } from "@/lib/types";

const GHOST_ROW_HEIGHT = 28;

interface TrackedRow {
  id: string;
  date: string;
  el: HTMLElement | null;
  periodKey: string;
}

interface GhostRowsData {
  dates: string[];
  gapY: number;
  expandedHeight: number;
  pointerY: number;
  highlightedDate: string | null;
  isEdgeCase: "top" | "bottom" | false;
}

function getPeriodBoundaries(date: string, periodType: PeriodType): { start: string; end: string } {
  const dt = DateTime.fromISO(date);
  switch (periodType) {
    case "monthly":
      return { start: dt.startOf("month").toISODate() || date, end: dt.endOf("month").toISODate() || date };
    case "weekly":
      return { start: dt.startOf("week").toISODate() || date, end: dt.endOf("week").toISODate() || date };
    case "bi-weekly": {
      const weekNumber = dt.weekNumber;
      const biWeekStart = dt.startOf("week").minus({ weeks: (weekNumber - 1) % 2 });
      const biWeekEnd = biWeekStart.plus({ weeks: 1 }).endOf("week");
      return { start: biWeekStart.toISODate() || date, end: biWeekEnd.toISODate() || date };
    }
    case "custom":
      return { start: date, end: date };
    default:
      return { start: dt.startOf("month").toISODate() || date, end: dt.endOf("month").toISODate() || date };
  }
}

function generateGhostDates(
  topDate: string,
  bottomDate: string,
  isEdgeCase: "top" | "bottom" | false,
  periodType: PeriodType,
  maxCount: number = 60
): string[] {
  const dates: string[] = [];

  if (isEdgeCase === "top") {
    const { end } = getPeriodBoundaries(bottomDate, periodType);
    let current = DateTime.fromISO(topDate);
    const endDate = DateTime.fromISO(end);
    while (current <= endDate && dates.length < maxCount) {
      dates.push(current.toISODate() || topDate);
      current = current.plus({ days: 1 });
    }
  } else if (isEdgeCase === "bottom") {
    const { start } = getPeriodBoundaries(topDate, periodType);
    let current = DateTime.fromISO(start);
    const endDate = DateTime.fromISO(bottomDate);
    while (current <= endDate && dates.length < maxCount) {
      dates.push(current.toISODate() || bottomDate);
      current = current.plus({ days: 1 });
    }
  } else {
    let current = DateTime.fromISO(topDate);
    const endDate = DateTime.fromISO(bottomDate);
    while (current <= endDate && dates.length < maxCount) {
      dates.push(current.toISODate() || topDate);
      current = current.plus({ days: 1 });
    }
  }

  return dates;
}

export function useDragDatePreview(periodType: PeriodType) {
  const pointerYRef = React.useRef<number>(-1);
  const rowMapRef = React.useRef(new Map<string, TrackedRow>());
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentGapRef = React.useRef<string | null>(null);

  const [previewDate, setPreviewDate] = React.useState<string | null>(null);
  const [ghostRows, setGhostRows] = React.useState<GhostRowsData | null>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const isPreviewActive = !!activeId;

  const registerRow = React.useCallback((id: string, date: string, el: HTMLElement | null, periodKey: string) => {
    if (el) {
      rowMapRef.current.set(id, { id, date, el, periodKey });
    } else {
      rowMapRef.current.delete(id);
    }
  }, []);

  const setActive = React.useCallback((id: string | null) => {
    setActiveId(id);
  }, []);

  const getRowMap = React.useCallback(() => rowMapRef.current, []);

  const updatePointerY = React.useCallback((y: number) => {
    pointerYRef.current = y;
    updatePreview();
  }, []);

  const updatePreview = React.useCallback(() => {
    const y = pointerYRef.current;
    if (y < 0) return;

    const rows = Array.from(rowMapRef.current.values())
      .filter((r) => r.el !== null && r.id !== activeId)
      .map((r) => ({
        id: r.id,
        date: r.date,
        periodKey: r.periodKey,
        rect: r.el!.getBoundingClientRect(),
      }))
      .sort((a, b) => a.rect.top - b.rect.top);

    if (rows.length === 0) {
      setPreviewDate(null);
      setGhostRows(null);
      currentGapRef.current = null;
      return;
    }

    if (rows.length === 1) {
      setPreviewDate(rows[0].date);
      setGhostRows(null);
      currentGapRef.current = null;
      return;
    }

    let topRow: (typeof rows)[0] | null = null;
    let bottomRow: (typeof rows)[0] | null = null;
    let isEdgeCase: "top" | "bottom" | false = false;

    for (let i = 0; i < rows.length - 1; i++) {
      const current = rows[i];
      const next = rows[i + 1];

      if (y >= current.rect.bottom && y <= next.rect.top) {
        topRow = current;
        bottomRow = next;
        break;
      }
    }

    if (!topRow || !bottomRow) {
      if (y < rows[0].rect.top) {
        topRow = rows[0];
        bottomRow = rows[1] ?? rows[0];
        isEdgeCase = "top";
      } else if (y > rows[rows.length - 1].rect.bottom) {
        topRow = rows[rows.length - 2] ?? rows[rows.length - 1];
        bottomRow = rows[rows.length - 1];
        isEdgeCase = "bottom";
      } else {
        for (const row of rows) {
          if (y >= row.rect.top && y <= row.rect.bottom) {
            topRow = row;
            bottomRow = row;
            break;
          }
        }
      }
    }

    if (!topRow || !bottomRow) {
      if (currentGapRef.current !== null) {
        currentGapRef.current = null;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setGhostRows(null);
      }
      return;
    }

    const gapTop = topRow.rect.bottom;
    const gapBottom = bottomRow.rect.top;
    const gapHeight = gapBottom - gapTop;

    let ratio: number;
    if (gapHeight > 0 && y >= gapTop && y <= gapBottom) {
      ratio = (y - gapTop) / gapHeight;
    } else {
      ratio = 0.5;
    }

    ratio = Math.max(0, Math.min(1, ratio));

    const date = interpolateDate(topRow.date, bottomRow.date, ratio);
    setPreviewDate(date);

    const gapKey = `${topRow.id}-${bottomRow.id}`;

    if (gapKey !== currentGapRef.current) {
      currentGapRef.current = gapKey;
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        const dates = generateGhostDates(topRow!.date, bottomRow!.date, isEdgeCase, periodType);
        const expandedHeight = dates.length * GHOST_ROW_HEIGHT;

        const ghostIndex = Math.min(
          Math.floor((y - gapTop) / Math.max(gapHeight, 1)),
          dates.length - 1
        );
        const highlightedDate = dates[Math.max(0, ghostIndex)];

        setGhostRows({
          dates,
          gapY: gapTop,
          expandedHeight,
          pointerY: y,
          highlightedDate,
          isEdgeCase,
        });
      }, 200);
    }
  }, [activeId, periodType]);

  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return {
    previewDate,
    ghostRows,
    isPreviewActive,
    registerRow,
    setActive,
    updatePointerY,
    getRowMap,
  };
}
