"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface InfiniteScrollLoaderProps {
  hasMore: boolean;
  onLoadMore: () => void;
  hasItems?: boolean;
}

export function InfiniteScrollLoader({
  hasMore,
  onLoadMore,
  hasItems = true,
}: InfiniteScrollLoaderProps) {
  const loaderRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = loaderRef.current;
    if (!element || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  if (!hasMore) {
    if (!hasItems) return null;
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-6 text-sm text-text-secondary"
      >
        End of ledger
      </motion.div>
    );
  }

  return <div ref={loaderRef} className="py-6" />;
}
