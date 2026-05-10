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
  isDimmed?: boolean;
  isDragEnabled?: boolean;
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
  isDragEnabled = false,
}: LedgerRowProps) {
  const handleClick = () => {
    if (!isEditing && onStartEdit) onStartEdit();
  };

  const dimClass = isDimmed ? "opacity-40" : "";
  const dimBorderClass = isDimmed ? "border-l-border/30" : "";

  const gridCols = isDragEnabled
    ? "grid-cols-[28px_1fr] md:grid-cols-[28px_100px_1fr_1fr_90px_64px]"
    : "grid-cols-[0_1fr] md:grid-cols-[0_100px_1fr_1fr_90px_64px]";

  const classes = cn(
    "group grid items-center transition-all duration-200 ease-out",
    gridCols,
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

  const grid = (
    <div className={classes}>
      {/** Always present to maintain grid column count for auto-placement */}
      <div className="overflow-hidden">
        <AnimatePresence>
          {isDragEnabled && (
            <motion.div
              key="handle"
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
          )}
        </AnimatePresence>
      </div>
      <LedgerRowContent
        item={item}
        userName={userName}
        onClick={handleClick}
      />
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
