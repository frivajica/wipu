"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { LedgerItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/formatting";
import { Avatar } from "@/components/ui/avatar";
import { DragHandle } from "./drag-handle";
import { RowContextMenu } from "./row-context-menu";
import { SwipeToDelete } from "./swipe-to-delete";

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
  isOwned?: boolean;
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
  isOwned = false,
}: LedgerRowProps) {
  const isPositive = item.amount >= 0;

  const handleClick = () => {
    if (!isEditing && onStartEdit) {
      onStartEdit();
    }
  };

  const rowContent = (
    <div
      className={cn(
        "group grid items-center transition-colors",
        "md:grid-cols-[32px_120px_1fr_120px_100px_60px] md:gap-4 md:px-4 md:py-2.5",
        "grid-cols-[32px_1fr] gap-3 px-3 py-3",
        "hover:bg-surface-elevated/50",
        isDragging && "opacity-90 bg-surface-elevated cursor-grabbing shadow-xl rounded-lg z-50 scale-[1.02]",
        isEditing && "bg-primary-accent/5"
      )}
    >
      {/* Drag Handle */}
      <DragHandle
        {...dragHandleProps}
        isDragging={isDragging}
        className="md:w-8 md:h-8 w-11 h-11"
      />

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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
    >
      {/* Mobile: Swipe to delete */}
      <div className="md:hidden">
        <SwipeToDelete
          onDelete={() => onDelete(item.id)}
          requiresConfirmation={!isOwned}
        >
          {rowContent}
        </SwipeToDelete>
      </div>

      {/* Desktop: Right-click context menu */}
      <div className="hidden md:block">
        <RowContextMenu
          onDelete={() => onDelete(item.id)}
          requiresConfirmation={!isOwned}
        >
          {rowContent}
        </RowContextMenu>
      </div>
    </motion.div>
  );
}
