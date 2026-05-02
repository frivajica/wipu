"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { AddItemRow } from "./add-item-row";
import { Plus, Receipt } from "lucide-react";

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
      className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm"
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
        <div className="text-center py-12">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex mb-4"
          >
            <Receipt className="h-12 w-12 text-text-secondary/40" />
          </motion.div>
          <p className="text-text-secondary mb-4">
            No items yet. Add your first transaction!
          </p>
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary-accent text-white hover:bg-primary-accent/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent focus-visible:ring-offset-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add your first transaction
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
