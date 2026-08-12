"use client";

import { motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Something went wrong loading this data.", onRetry }: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-2xl border border-border/50 shadow-card text-center py-12 px-6"
    >
      <TriangleAlert className="h-10 w-10 text-text-tertiary/60 mx-auto mb-4" />
      <p className="text-text-secondary mb-5 font-medium">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </motion.div>
  );
}
