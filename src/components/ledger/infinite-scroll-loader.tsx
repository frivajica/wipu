"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface InfiniteScrollLoaderProps {
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  loaderRef?: React.Ref<HTMLDivElement>;
}

export function InfiniteScrollLoader({
  isLoading,
  hasMore,
  onLoadMore,
  loaderRef,
}: InfiniteScrollLoaderProps) {
  const internalRef = React.useRef<HTMLDivElement>(null);
  const ref = (loaderRef as React.RefObject<HTMLDivElement>) || internalRef;

  React.useEffect(() => {
    const element = ref.current;
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
  }, [ref, hasMore, isLoading, onLoadMore]);

  if (!hasMore) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-6 text-sm text-text-secondary"
      >
        All caught up
      </motion.div>
    );
  }

  return (
    <div ref={ref} className="flex items-center justify-center py-6 gap-2 text-sm text-text-secondary">
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
