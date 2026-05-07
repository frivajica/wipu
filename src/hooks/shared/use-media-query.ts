"use client";

import * as React from "react";

/**
 * SSR-safe media query hook.
 * Returns `null` initially (SSR + first hydration render),
 * then the actual breakpoint match after mount.
 *
 * Usage: renders both variants during SSR, then only the matching
 * variant on client — avoiding hydration mismatches.
 */
export function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handler = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
