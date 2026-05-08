"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface InfiniteScrollLoaderProps {
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  hasItems?: boolean;
}

export function InfiniteScrollLoader({
  isLoading,
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
        if (entries[0].isIntersecting && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

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

  return (
    <div ref={loaderRef} className="flex items-center justify-center py-6 gap-2 text-sm text-text-secondary">
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading older periods...
        </>
      ) : (
        <span className="opacity-0">Loading...</span>
      )}
    </div>
  );
}
