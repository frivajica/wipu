"use client";

import * as React from "react";
import { LedgerItem } from "@/lib/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { GripVertical } from "lucide-react";

interface LedgerRowProps {
  item: LedgerItem;
  userName: string;
  onEdit: (item: LedgerItem) => void;
  onDelete: (id: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onCancelEdit?: () => void;
}

export function LedgerRow({
  item,
  userName,
  onEdit,
  onDelete,
  dragHandleProps,
  isDragging,
  isEditing,
  onStartEdit,
  onCancelEdit,
}: LedgerRowProps) {
  const isPositive = item.amount >= 0;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm("Delete this item?")) {
      onDelete(item.id);
    }
  };

  const handleClick = () => {
    if (!isEditing && onStartEdit) {
      onStartEdit();
    }
  };

  return (
    <div
      className={cn(
        "group grid items-center hover:bg-surface-elevated/50 transition-colors",
        "md:grid-cols-[32px_120px_1fr_120px_100px_60px] md:gap-4 md:px-4 md:py-2.5",
        "grid-cols-[32px_1fr] gap-3 px-3 py-3",
        isDragging && "opacity-50 bg-surface-elevated",
        isEditing && "bg-primary-accent/5"
      )}
      onContextMenu={handleContextMenu}
    >
      {/* Drag Handle */}
      <button
        {...dragHandleProps}
        className={cn(
          "flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors",
          "md:w-8 md:h-8 w-10 h-10",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent focus-visible:ring-offset-2 rounded"
        )}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" />
      </button>

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
        onClick={handleClick}
      >
        {formatCurrency(item.amount)}
      </div>

      <div
        className="hidden md:block text-sm text-text-primary truncate cursor-pointer"
        onClick={handleClick}
      >
        {item.description}
      </div>

      <div
        className="hidden md:block cursor-pointer"
        onClick={handleClick}
      >
        <span className="inline-flex px-2 py-0.5 text-xs bg-surface-elevated rounded-full text-text-secondary">
          {item.category}
        </span>
      </div>

      <div
        className="hidden md:block text-sm text-text-secondary cursor-pointer"
        onClick={handleClick}
      >
        {formatDate(item.date)}
      </div>

      <div className="hidden md:flex justify-center">
        <button
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent focus-visible:ring-offset-2 rounded-full"
          onClick={handleClick}
        >
          <Avatar name={userName} size="sm" />
        </button>
      </div>
    </div>
  );
}
