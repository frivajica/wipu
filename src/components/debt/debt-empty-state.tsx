import { motion } from "framer-motion";
import { Wallet, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SPRING_GENTLE } from "@/lib/animations";

interface DebtEmptyStateProps {
  onCreate?: () => void;
}

export function DebtEmptyState({ onCreate }: DebtEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING_GENTLE}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface py-16 text-center"
    >
      <div className="mb-4 rounded-full bg-surface-strong p-4">
        <Wallet className="h-8 w-8 text-text-tertiary" />
      </div>
      <h3 className="text-lg font-semibold text-text">No debt groups yet</h3>
      <p className="mt-1 max-w-sm text-sm text-text-secondary">
        Create a group to start tracking shared debts.
      </p>
      {onCreate && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onCreate}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Group
        </Button>
      )}
    </motion.div>
  );
}
