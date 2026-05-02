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
      <div className="md:hidden flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "font-semibold",
              isPositive ? "text-secondary" : "text-error"
            )}
          >
            {formatCurrency(item.amount)}
          </span>
          <Avatar name={userName} size="sm" />
        </div>
        <span className="text-sm text-text-primary truncate">
          {item.description}
        </span>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span className="px-1.5 py-0.5 bg-surface-elevated rounded">
            {item.category}
          </span>
          <span>{formatDate(item.date)}</span>
        </div>
      </div>

      {/* Desktop Layout */}
      <div
        className={cn(
          "hidden md:block font-medium tabular-nums cursor-pointer",
          isPositive ? "text-secondary" : "text-error"
        )}
        onClick={onClick}
      >
        {formatCurrency(item.amount)}
      </div>

      <div
        className="hidden md:block text-sm text-text-primary truncate cursor-pointer"
        onClick={onClick}
      >
        {item.description}
      </div>

      <div className="hidden md:block cursor-pointer" onClick={onClick}>
        <span className="inline-flex px-2 py-0.5 text-xs bg-surface-elevated rounded-full text-text-secondary">
          {item.category}
        </span>
      </div>

      <div
        className="hidden md:block text-sm text-text-secondary cursor-pointer"
        onClick={onClick}
      >
        {formatDate(item.date)}
      </div>

      <div className="hidden md:flex justify-center">
        <button
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent focus-visible:ring-offset-2 rounded-full"
          onClick={onClick}
        >
          <Avatar name={userName} size="sm" />
        </button>
      </div>
    </>
  );
}
