"use client";

import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/formatting";
import { LedgerItem } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { Trash2 } from "lucide-react";

interface DebtItemRowProps {
  item: LedgerItem;
  userName: string;
  onClick: () => void;
  onDelete: (id: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
}

export function DebtItemRow({
  item,
  userName,
  onClick,
  onDelete,
  dragHandleProps,
  isDragging,
}: DebtItemRowProps) {
  const isPositive = item.amount >= 0;

  return (
    <div
      className={cn(
        "group flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg",
        "hover:bg-surface-strong/50 transition-colors duration-150",
        isDragging && "opacity-50 bg-surface-elevated shadow-md"
      )}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {dragHandleProps && (
          <button
            type="button"
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing p-0.5 text-text-tertiary hover:text-text-secondary shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <circle cx="2" cy="2" r="1.5" />
              <circle cx="2" cy="6" r="1.5" />
              <circle cx="2" cy="10" r="1.5" />
              <circle cx="10" cy="2" r="1.5" />
              <circle cx="10" cy="6" r="1.5" />
              <circle cx="10" cy="10" r="1.5" />
            </svg>
          </button>
        )}
        <span
          className={cn(
            "text-sm font-medium tabular-nums shrink-0",
            isPositive ? "text-danger" : "text-success"
          )}
        >
          {formatCurrency(item.amount)}
        </span>
        <span
          className="text-sm text-text-secondary truncate cursor-pointer"
          onClick={onClick}
        >
          {item.description}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-text-tertiary">{formatDate(item.date)}</span>
        <button
          type="button"
          className="focus-visible:outline-none focus-visible:shadow-glow-focus rounded-full"
          onClick={onClick}
        >
          <Avatar name={userName} size="sm" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm("Delete this item?")) {
              onDelete(item.id);
            }
          }}
          className={cn(
            "p-1 rounded-md text-text-tertiary hover:text-danger hover:bg-danger/10",
            "transition-all duration-150",
            "opacity-100 md:opacity-0 md:group-hover:opacity-100"
          )}
          aria-label="Delete item"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
