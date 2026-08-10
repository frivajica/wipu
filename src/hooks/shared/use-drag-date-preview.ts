"use client";

import * as React from "react";
import { interpolateDate } from "@/lib/date-utils";

interface TrackedRow {
  id: string;
  date: string;
  el: HTMLElement | null;
}

export function useDragDatePreview() {
  const pointerYRef = React.useRef<number>(-1);
  const rowMapRef = React.useRef(new Map<string, TrackedRow>());

  const [previewDate, setPreviewDate] = React.useState<string | null>(null);
  const [gapY, setGapY] = React.useState<number | null>(null);
  const [insertIndex, setInsertIndex] = React.useState<number>(-1);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const isPreviewActive = !!activeId;

  const registerRow = React.useCallback((id: string, date: string, el: HTMLElement | null) => {
    if (el) {
      rowMapRef.current.set(id, { id, date, el });
    } else {
      rowMapRef.current.delete(id);
    }
  }, []);

  const setActive = React.useCallback((id: string | null) => {
    setActiveId(id);
  }, []);

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
        rect: r.el!.getBoundingClientRect(),
      }))
      .sort((a, b) => a.rect.top - b.rect.top);

    if (rows.length === 0) {
      setPreviewDate(null);
      setGapY(null);
      setInsertIndex(0);
      return;
    }

    if (rows.length === 1) {
      setPreviewDate(rows[0].date);
      setGapY(rows[0].rect.top);
      setInsertIndex(y < rows[0].rect.top ? 0 : 1);
      return;
    }

    let topRow: (typeof rows)[0] | null = null;
    let bottomRow: (typeof rows)[0] | null = null;
    let topIndex = -1;

    for (let i = 0; i < rows.length - 1; i++) {
      const current = rows[i];
      const next = rows[i + 1];

      if (y >= current.rect.bottom && y <= next.rect.top) {
        topRow = current;
        bottomRow = next;
        topIndex = i;
        break;
      }
    }

    if (!topRow || !bottomRow) {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (y >= row.rect.top && y <= row.rect.bottom) {
          topRow = row;
          bottomRow = row;
          topIndex = i;
          break;
        }
      }
    }

    if (!topRow) {
      if (y < rows[0].rect.top) {
        topRow = rows[0];
        bottomRow = rows[1] ?? rows[0];
        topIndex = -1;
      } else {
        topRow = rows[rows.length - 2] ?? rows[rows.length - 1];
        bottomRow = rows[rows.length - 1];
        topIndex = rows.length - 2;
      }
    }

    if (!topRow || !bottomRow) return;

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

    const computedIndex = topIndex >= 0 ? topIndex + 1 : 0;

    setPreviewDate(date);
    setGapY(gapTop);
    setInsertIndex(computedIndex);
  }, [activeId]);

  return {
    previewDate,
    gapY,
    insertIndex,
    isPreviewActive,
    registerRow,
    setActive,
    updatePointerY,
  };
}
