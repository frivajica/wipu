"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RecurringRule } from "@/hooks/use-recurring";
import { formatCurrency } from "@/lib/formatting";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Repeat } from "lucide-react";
import { SPRING_DEFAULT } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface RecurringPanelProps {
  rules: RecurringRule[];
  onCreate: () => void;
}

export function RecurringPanel({ rules, onCreate }: RecurringPanelProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!rules.length && !isExpanded) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-border/40 bg-surface px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Repeat className="h-4 w-4" />
          <span>No recurring rules</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/40 bg-surface overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface-strong/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Repeat className="h-4 w-4 text-primary-accent" />
          <span className="text-sm font-medium text-text-primary">
            Recurring Rules ({rules.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onCreate(); }}>
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="h-4 w-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/40 px-4 py-3 space-y-2">
              {rules.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-4">
                  No recurring rules yet. Create one to auto-generate ledger items.
                </p>
              ) : (
                rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between rounded-lg border border-border/40 bg-surface-strong px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {rule.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <span>{formatCurrency(rule.amount)}</span>
                        <span>·</span>
                        <span className="capitalize">{rule.frequencyUnit}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {rule.startDate}
                        </span>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 ml-2 text-xs font-medium px-2 py-0.5 rounded-full",
                        rule.isActive
                          ? "bg-success/10 text-success"
                          : "bg-text-tertiary/10 text-text-tertiary"
                      )}
                    >
                      {rule.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
