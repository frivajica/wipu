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
              "group grid md:hidden items-center transition-colors",
              "grid-cols-[32px_1fr] gap-3 px-3 py-3",
              "hover:bg-surface-elevated/50",
              isDragging && "opacity-90 bg-surface-elevated shadow-xl rounded-lg z-50 scale-[1.02]",
              isEditing && "bg-primary-accent/5"
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
