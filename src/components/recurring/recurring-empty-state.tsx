import { motion } from "framer-motion";
import { Repeat, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SPRING_GENTLE } from "@/lib/animations";

interface RecurringEmptyStateProps {
  onCreate?: () => void;
}

export function RecurringEmptyState({ onCreate }: RecurringEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING_GENTLE}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface py-16 text-center"
    >
      <div className="mb-4 rounded-full bg-surface-strong p-4">
        <Repeat className="h-8 w-8 text-text-tertiary" />
      </div>
      <h3 className="text-lg font-semibold text-text">No recurring rules yet</h3>
      <p className="mt-1 max-w-sm text-sm text-text-secondary">
        Create rules to automatically apply the same amount to your balances on a schedule.
      </p>
      {onCreate && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onCreate}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Rule
        </Button>
      )}
    </motion.div>
  );
}