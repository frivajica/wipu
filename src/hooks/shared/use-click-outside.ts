"use client";

import * as React from "react";

export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  onClickOutside: () => void,
  events: ("mousedown" | "touchstart")[] = ["mousedown", "touchstart"]
) {
  React.useEffect(() => {
    function handler(event: Event) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside();
      }
    }

    events.forEach((event) => document.addEventListener(event, handler));
    return () => events.forEach((event) => document.removeEventListener(event, handler));
  }, [ref, onClickOutside, events]);
}
