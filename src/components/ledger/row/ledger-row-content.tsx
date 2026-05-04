"use client";

import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/formatting";
import { LedgerItem } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";

interface LedgerRowContentProps {
  item: LedgerItem;
  userName: string;
  onClick: () => void;
}

export function LedgerRowContent({ item, userName, onClick }: LedgerRowContentProps) {
  const isPositive = item.amount >= 0;

  return (
    <>
      {/* Mobile Layout */}
      <div
        className="md:hidden flex flex-col gap-1.5 cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "font-semibold tabular-nums",
              isPositive ? "text-secondary" : "text-error"
            )}
          >
            {formatCurrency(item.amount)}
          </span>
          <Avatar name={userName} size="sm" />
        </div>
        <span className="text-sm text-text-primary font-medium truncate">
          {item.description}
        </span>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span className="px-2 py-0.5 bg-surface-warm border border-border/50 rounded-full font-medium text-text-secondary">
            {item.category}
          </span>
          <span className="text-text-tertiary">{formatDate(item.date)}</span>
        </div>
      </div>

      {/* Desktop Layout */}
      <div
        className={cn(
          "hidden md:block font-semibold tabular-nums cursor-pointer",
          isPositive ? "text-secondary" : "text-error"
        )}
        onClick={onClick}
      >
        {formatCurrency(item.amount)}
      </div>

      <div
        className="hidden md:block text-sm text-text-primary font-medium truncate cursor-pointer"
        onClick={onClick}
      >
        {item.description}
      </div>

      <div className="hidden md:block cursor-pointer" onClick={onClick}>
        <span className="inline-flex px-2.5 py-0.5 text-xs bg-surface-warm border border-border/50 rounded-full text-text-secondary font-medium">
          {item.category}
        </span>
      </div>

      <div
        className="hidden md:block text-sm text-text-tertiary cursor-pointer"
        onClick={onClick}
      >
        {formatDate(item.date)}
      </div>

      <div className="hidden md:flex justify-center">
        <button
          className="focus-visible:outline-none focus-visible:shadow-glow-focus rounded-full"
          onClick={onClick}
        >
          <Avatar name={userName} size="sm" />
        </button>
      </div>
    </>
  );
}
