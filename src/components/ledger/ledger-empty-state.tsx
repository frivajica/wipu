"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { AddItemRow } from "./add-item-row";
import { Plus, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

interface LedgerEmptyStateProps {
  onAdd: (data: {
    amount: number;
    description: string;
    category: string;
    date: string;
  }) => void;
}

export function LedgerEmptyState({ onAdd }: LedgerEmptyStateProps) {
  const [isAdding, setIsAdding] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-surface rounded-2xl border border-border/50",
        "shadow-card overflow-hidden"
      )}
    >
      {isAdding ? (
        <AddItemRow
          onSubmit={(data) => {
            onAdd(data);
            setIsAdding(false);
          }}
          onCancel={() => setIsAdding(false)}
        />
      ) : (
        <div className="text-center py-14">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex mb-5"
          >
            <Receipt className="h-12 w-12 text-text-tertiary/50" />
          </motion.div>
          <p className="text-text-secondary mb-5 font-medium">
            No items yet. Add your first transaction!
          </p>
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setIsAdding(true)}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium",
              "bg-primary-accent text-white shadow-card hover:bg-primary-accent-hover hover:shadow-card-hover",
              "transition-all duration-200 ease-out hover:-translate-y-px",
              "focus-visible:outline-none focus-visible:shadow-glow-focus cursor-pointer"
            )}
          >
            <Plus className="h-4 w-4" />
            Add your first transaction
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
