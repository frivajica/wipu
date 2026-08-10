"use client";

import * as React from "react";
import { useDndContext } from "@dnd-kit/core";
import { interpolateDate } from "@/lib/date-utils";

interface TrackedRow {
  id: string;
  date: string;
  el: HTMLElement | null;
}

export function useDragDatePreview(items: Array<{ id: string; date: string }>) {
  const { active } = useDndContext();
  const pointerYRef = React.useRef<number>(-1);
  const rowMapRef = React.useRef(new Map<string, TrackedRow>());

  const [previewDate, setPreviewDate] = React.useState<string | null>(null);
  const [insertionY, setInsertionY] = React.useState<number | null>(null);

  const isPreviewActive = !!active;

  const registerRow = React.useCallback((id: string, date: string, el: HTMLElement | null) => {
    if (el) {
      rowMapRef.current.set(id, { id, date, el });
    } else {
      rowMapRef.current.delete(id);
    }
  }, []);

  const updatePointerY = React.useCallback((y: number) => {
    pointerYRef.current = y;
    updatePreview();
  }, []);

  const updatePreview = React.useCallback(() => {
    const y = pointerYRef.current;
    if (y < 0) return;

    const rows = Array.from(rowMapRef.current.values())
      .filter((r) => r.el !== null)
      .map((r) => ({
        ...r,
        rect: r.el!.getBoundingClientRect(),
      }))
      .sort((a, b) => a.rect.top - b.rect.top);

    if (rows.length < 2) {
      setPreviewDate(null);
      setInsertionY(null);
      return;
    }

    let topRow: (typeof rows)[0] | null = null;
    let bottomRow: (typeof rows)[0] | null = null;

    for (let i = 0; i < rows.length - 1; i++) {
      const current = rows[i];
      const next = rows[i + 1];

      if (y >= current.rect.top && y <= next.rect.bottom) {
        topRow = current;
        bottomRow = next;
        break;
      }
    }

    if (!topRow || !bottomRow) {
      if (y < rows[0].rect.top) {
        topRow = rows[0];
        bottomRow = rows[1] ?? rows[0];
      } else if (y > rows[rows.length - 1].rect.bottom) {
        topRow = rows[rows.length - 2] ?? rows[rows.length - 1];
        bottomRow = rows[rows.length - 1];
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

    if (!topRow || !bottomRow) return;

    const gapTop = topRow.rect.bottom;
    const gapBottom = bottomRow.rect.top;
    const gapHeight = gapBottom - gapTop;

    let ratio: number;
    if (gapHeight > 0 && y >= gapTop && y <= gapBottom) {
      ratio = (y - gapTop) / gapHeight;
    } else if (topRow.id === bottomRow.id) {
      ratio = 0.5;
    } else {
      ratio = 0.5;
    }

    ratio = Math.max(0, Math.min(1, ratio));

    const date = interpolateDate(topRow.date, bottomRow.date, ratio);
    const insertionPosition = gapTop + gapHeight * ratio;

    setPreviewDate(date);
    setInsertionY(insertionPosition);
  }, []);

  return {
    previewDate,
    insertionY,
    isPreviewActive,
    registerRow,
    updatePointerY,
  };
}
