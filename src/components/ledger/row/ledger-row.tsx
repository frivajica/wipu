"use client";

import * as React from "react";
import { LedgerItem } from "@/lib/types";
import { LedgerRowContent } from "./ledger-row-content";
import { DragHandle } from "../drag-handle";
import { SwipeToDelete } from "../swipe-to-delete";
import { RowContextMenu } from "../row-context-menu";
import { cn } from "@/lib/utils";

function getDebtColorClass(type: string) {
  return type === "debt" ? "border-l-debt" : "border-l-border";
}

interface LedgerRowProps {
  item: LedgerItem;
  userName: string;
  onEdit: (item: LedgerItem) => void;
  onDelete: (id: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
  isEditing?: boolean;
  onStartEdit?: () => void;
  isOwned?: boolean;
  isDimmed?: boolean;
}

export function LedgerRow({
  item,
  userName,
  onDelete,
  dragHandleProps,
  isDragging,
  isEditing,
  onStartEdit,
  isOwned,
  isDimmed,
}: LedgerRowProps) {
  const handleClick = () => {
    if (!isEditing && onStartEdit) onStartEdit();
  };

  const dimClass = isDimmed ? "opacity-40" : "";
  const dimBorderClass = isDimmed ? "border-l-border/30" : "";

  const classes = cn(
    "group grid items-center transition-all duration-200 ease-out",
    "grid-cols-[28px_1fr] md:grid-cols-[28px_100px_1fr_1fr_90px_64px]",
    "gap-2 md:gap-3 px-2.5 py-2 md:px-3 md:py-2",
    "rounded-lg bg-surface border border-border/40 border-l-4",
    isDimmed ? dimBorderClass : getDebtColorClass(item.type),
    "shadow-card",
    "md:hover:shadow-card-hover md:hover:border-border-hover",
    "active:shadow-inner-active",
    dimClass,
    isDragging && "opacity-90 bg-surface-elevated shadow-xl rounded-lg z-50 scale-[1.02] border-primary-accent/20",
    isEditing && "bg-primary-accent/4 border-primary-accent/20 shadow-glow-focus"
  );

  const content = (
    <>
      <DragHandle {...dragHandleProps} isDragging={isDragging} />
      <LedgerRowContent item={item} userName={userName} onClick={handleClick} />
    </>
  );

  return (
    <RowContextMenu
      onDelete={() => onDelete(item.id)}
      requiresConfirmation={!isOwned}
    >
      <div className="hidden md:block">
        <div className={classes}>{content}</div>
      </div>
      <div className="md:hidden">
        <SwipeToDelete
          onDelete={() => onDelete(item.id)}
          requiresConfirmation={!isOwned}
        >
          <div className={classes}>{content}</div>
        </SwipeToDelete>
      </div>
    </RowContextMenu>
  );
}
