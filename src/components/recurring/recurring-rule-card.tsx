"use client";

import { RecurringRule } from "@/hooks/use-recurring";
import { formatCurrency } from "@/lib/formatting";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Pencil, Trash2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecurringRuleCardProps {
  rule: RecurringRule;
  onEdit: (rule: RecurringRule) => void;
  onDelete: (rule: RecurringRule) => void;
  onToggleActive: (rule: RecurringRule) => void;
}

function formatFrequency(rule: RecurringRule): string {
  const interval = rule.intervalCount > 1 ? `Every ${rule.intervalCount} ` : "";
  return `${interval}${rule.frequencyUnit}`;
}

export function RecurringRuleCard({
  rule,
  onEdit,
  onDelete,
  onToggleActive,
}: RecurringRuleCardProps) {
  return (
    <div className="rounded-xl border border-border/40 bg-surface px-4 py-3">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-primary truncate">
            {rule.description}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-secondary">
            <span className="font-semibold tabular-nums text-text-primary">
              {formatCurrency(rule.amount)}
            </span>
            <span>·</span>
            <span className="capitalize">{formatFrequency(rule)}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {rule.startDate}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 md:shrink-0">
          <span
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
              rule.isActive
                ? "bg-success/10 text-success"
                : "bg-text-tertiary/10 text-text-tertiary"
            )}
          >
            {rule.isActive ? "Active" : "Paused"}
          </span>
          <Toggle
            checked={rule.isActive}
            onChange={() => onToggleActive(rule)}
            ariaLabel={rule.isActive ? "Pause recurring rule" : "Activate recurring rule"}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(rule)}
            aria-label="Edit recurring rule"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(rule)}
            aria-label="Delete recurring rule"
            className="text-text-tertiary hover:text-error"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}