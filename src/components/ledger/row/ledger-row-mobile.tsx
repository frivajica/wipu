"use client";

import { motion } from "framer-motion";
import { LedgerItem } from "@/lib/types";
import { LedgerRowContent } from "./ledger-row-content";
import { DragHandle } from "../drag-handle";
import { SwipeToDelete } from "../swipe-to-delete";
import { RowContextMenu } from "../row-context-menu";
import { cn } from "@/lib/utils";

interface LedgerRowMobileProps {
  item: LedgerItem;
  userName: string;
  onEdit: (item: LedgerItem) => void;
  onDelete: (id: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
  isEditing?: boolean;
  onStartEdit?: () => void;
  isOwned?: boolean;
}

export function LedgerRowMobile({
  item,
  userName,
  onDelete,
  dragHandleProps,
  isDragging,
  isEditing,
  onStartEdit,
  isOwned,
}: LedgerRowMobileProps) {
  const handleClick = () => {
    if (!isEditing && onStartEdit) onStartEdit();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
    >
      <RowContextMenu
        onDelete={() => onDelete(item.id)}
        requiresConfirmation={!isOwned}
      >
        <SwipeToDelete
          onDelete={() => onDelete(item.id)}
          requiresConfirmation={!isOwned}
        >
          <div
            className={cn(
              "group grid md:hidden items-center transition-all duration-200 ease-out",
              "grid-cols-[32px_1fr] gap-3 px-3 py-3",
              // Card shell: individual rounded row card
              "rounded-xl bg-surface border border-border/40",
              "shadow-card active:shadow-inner-active",
              // Dragging state
              isDragging && "opacity-90 bg-surface-elevated shadow-xl rounded-xl z-50 scale-[1.02] border-primary-accent/20",
              // Editing state
              isEditing && "bg-primary-accent/4 border-primary-accent/20 shadow-glow-focus"
            )}
          >
            <DragHandle
              {...dragHandleProps}
              isDragging={isDragging}
              className="w-11 h-11"
            />
            <LedgerRowContent
              item={item}
              userName={userName}
              onClick={handleClick}
            />
          </div>
        </SwipeToDelete>
      </RowContextMenu>
    </motion.div>
  );
}
