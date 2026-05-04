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
          "group hidden md:grid items-center transition-all duration-200 ease-out",
          "grid-cols-[32px_120px_1fr_1fr_100px_80px] gap-4 px-4 py-3",
          // Card shell: individual rounded row card
          "rounded-xl bg-surface border border-border/40",
          "shadow-card hover:shadow-card-hover hover:border-border-hover",
          // Dragging state
          isDragging && "opacity-90 bg-surface-elevated shadow-xl rounded-xl z-50 scale-[1.02] border-primary-accent/20",
          // Editing state: subtle indigo tint
          isEditing && "bg-primary-accent/[0.04] border-primary-accent/20 shadow-glow-focus"
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
