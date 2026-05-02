"use client";

import { LedgerItem } from "@/lib/types";
import { LedgerRowContent } from "./ledger-row-content";
import { DragHandle } from "../drag-handle";
import { RowContextMenu } from "../row-context-menu";
import { cn } from "@/lib/utils";

interface LedgerRowDesktopProps {
  item: LedgerItem;
  userName: string;
  onEdit: (_item: LedgerItem) => void;
  onDelete: (id: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
  isEditing?: boolean;
  onStartEdit?: () => void;
  isOwned?: boolean;
}

export function LedgerRowDesktop({
  item,
  userName,
  onEdit: _onEdit,
  onDelete,
  dragHandleProps,
  isDragging,
  isEditing,
  onStartEdit,
  isOwned,
}: LedgerRowDesktopProps) {
  const handleClick = () => {
    if (!isEditing && onStartEdit) onStartEdit();
  };

  return (
    <RowContextMenu
      onDelete={() => onDelete(item.id)}
      requiresConfirmation={!isOwned}
    >
      <div
        className={cn(
          "group hidden md:grid items-center transition-colors",
          "grid-cols-[32px_120px_1fr_120px_100px_60px] gap-4 px-4 py-2.5",
          "hover:bg-surface-elevated/50",
          isDragging && "opacity-90 bg-surface-elevated shadow-xl rounded-lg z-50 scale-[1.02]",
          isEditing && "bg-primary-accent/5"
        )}
      >
        <DragHandle
          {...dragHandleProps}
          isDragging={isDragging}
          className="w-8 h-8"
        />
        <LedgerRowContent
          item={item}
          userName={userName}
          onClick={handleClick}
        />
      </div>
    </RowContextMenu>
  );
}
