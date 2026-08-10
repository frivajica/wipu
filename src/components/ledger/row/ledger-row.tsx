"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LedgerItem } from "@/lib/types";
import { LedgerRowContent } from "./ledger-row-content";
import { DragHandle } from "../drag-handle";
import { SwipeToDelete } from "../swipe-to-delete";
import { RowContextMenu } from "../row-context-menu";
import { cn } from "@/lib/utils";
import { SPRING_SNAP } from "@/lib/animations";

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
  isDragEnabled?: boolean;
  isActive?: boolean;
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
  isDragEnabled = false,
  isActive,
}: LedgerRowProps) {
  const handleClick = () => {
    if (!isEditing && onStartEdit) onStartEdit();
  };

  const gridCols = isDragEnabled
    ? "grid-cols-[18px_1fr_18px] md:grid-cols-[18px_100px_1fr_1fr_90px_64px_18px]"
    : "grid-cols-[0_1fr_0] md:grid-cols-[0_100px_1fr_1fr_90px_64px_0]";

  const classes = cn(
    "group grid items-center transition-all duration-200 ease-out",
    gridCols,
    "gap-2 md:gap-3 px-2.5 py-2 md:px-3 md:py-2",
    "rounded-lg bg-surface border border-border/40 border-l-4",
    getDebtColorClass(item.type),
    "shadow-card",
    isActive && "shadow-card-hover border-border-hover",
    "md:hover:shadow-card-hover md:hover:border-border-hover",
    "active:shadow-inner-active",
    isDragging && "opacity-90 bg-surface-elevated shadow-xl rounded-lg z-50 scale-[1.02] border-primary-accent/20",
    isEditing && "bg-primary-accent/4 border-primary-accent/20 shadow-glow-focus"
  );

  const handleContent = isDragEnabled ? (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={SPRING_SNAP}
    >
      <DragHandle
        {...dragHandleProps}
        isDragging={isDragging}
      />
    </motion.div>
  ) : null;

  const grid = (
    <div className={classes}>
      <div className="overflow-hidden">
        <AnimatePresence>
          {handleContent}
        </AnimatePresence>
      </div>
      <LedgerRowContent
        item={item}
        userName={userName}
        onClick={handleClick}
      />
      <div className="overflow-hidden">
        <AnimatePresence>
          {handleContent}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <RowContextMenu
      onDelete={() => onDelete(item.id)}
      requiresConfirmation={!isOwned}
    >
      <div className="hidden md:block">{grid}</div>
      <div className="md:hidden">
        <SwipeToDelete
          onDelete={() => onDelete(item.id)}
          requiresConfirmation={!isOwned}
        >
          {grid}
        </SwipeToDelete>
      </div>
    </RowContextMenu>
  );
}
