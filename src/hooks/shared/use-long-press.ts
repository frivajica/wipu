"use client";

import * as React from "react";

export function useLongPress(
  onLongPress: (e: React.TouchEvent) => void,
  duration: number = 600
) {
  const timer = React.useRef<NodeJS.Timeout | null>(null);
  const isLongPress = React.useRef(false);

  const onTouchStart = (e: React.TouchEvent) => {
    isLongPress.current = false;
    timer.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress(e);
    }, duration);
  };

  const onTouchEnd = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const onTouchMove = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  return { onTouchStart, onTouchEnd, onTouchMove, isLongPress };
}
