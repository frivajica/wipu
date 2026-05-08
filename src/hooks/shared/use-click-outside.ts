"use client";

import * as React from "react";

export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  onClickOutside: () => void,
  events: ("mousedown" | "touchstart")[] = ["mousedown", "touchstart"]
) {
  const callbackRef = React.useRef(onClickOutside);
  React.useEffect(() => {
    callbackRef.current = onClickOutside;
  }, [onClickOutside]);

  React.useEffect(() => {
    function handler(event: Event) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callbackRef.current();
      }
    }

    events.forEach((event) => document.addEventListener(event, handler));
    return () => events.forEach((event) => document.removeEventListener(event, handler));
  }, [ref, events]);
}
