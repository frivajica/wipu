"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SkeletonPulse({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded", className)}>
      <motion.div
        className="h-full w-full bg-surface-elevated rounded"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
