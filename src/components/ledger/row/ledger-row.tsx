"use client";

import * as React from "react";
import { LedgerItem } from "@/lib/types";
import { LedgerRowContent } from "./ledger-row-content";
import { DragHandle } from "../drag-handle";
import { SwipeToDelete } from "../swipe-to-delete";
import { RowContextMenu } from "../row-context-menu";
import { useMediaQuery } from "@/hooks/shared/use-media-query";
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
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const handleClick = () => {
    if (!isEditing && onStartEdit) onStartEdit();
  };

  const dimClass = isDimmed ? "opacity-40" : "";
  const dimBorderClass = isDimmed ? "border-l-border/30" : "";

  if (isDesktop === null) {
    return (
      <>
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
                "rounded-lg bg-surface border border-border/40 border-l-4",
                isDimmed ? dimBorderClass : getDebtColorClass(item.type),
                "shadow-card active:shadow-inner-active",
                dimClass,
                isDragging && "opacity-90 bg-surface-elevated shadow-xl rounded-lg z-50 scale-[1.02] border-primary-accent/20",
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

        <RowContextMenu
          onDelete={() => onDelete(item.id)}
          requiresConfirmation={!isOwned}
        >
            <div
              className={cn(
                "group hidden md:grid items-center transition-all duration-200 ease-out",
                "grid-cols-[32px_120px_1fr_1fr_100px_80px] gap-4 px-4 py-3",
                "rounded-lg bg-surface border border-border/40 border-l-4",
                isDimmed ? dimBorderClass : getDebtColorClass(item.type),
                "shadow-card hover:shadow-card-hover hover:border-border-hover",
                dimClass,
                isDragging && "opacity-90 bg-surface-elevated shadow-xl rounded-lg z-50 scale-[1.02] border-primary-accent/20",
                isEditing && "bg-primary-accent/4 border-primary-accent/20 shadow-glow-focus"
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
      </>
    );
  }

  if (isDesktop) {
    return (
      <RowContextMenu
        onDelete={() => onDelete(item.id)}
        requiresConfirmation={!isOwned}
      >
        <div
          className={cn(
            "group grid items-center transition-all duration-200 ease-out",
            "grid-cols-[32px_120px_1fr_1fr_100px_80px] gap-4 px-4 py-3",
            "rounded-lg bg-surface border border-border/40 border-l-4",
            isDimmed ? dimBorderClass : getDebtColorClass(item.type),
            "shadow-card hover:shadow-card-hover hover:border-border-hover",
            dimClass,
            isDragging && "opacity-90 bg-surface-elevated shadow-xl rounded-lg z-50 scale-[1.02] border-primary-accent/20",
            isEditing && "bg-primary-accent/4 border-primary-accent/20 shadow-glow-focus"
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

  return (
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
            "group grid items-center transition-all duration-200 ease-out",
            "grid-cols-[32px_1fr] gap-3 px-3 py-3",
            "rounded-lg bg-surface border border-border/40 border-l-4",
            isDimmed ? dimBorderClass : getDebtColorClass(item.type),
            "shadow-card active:shadow-inner-active",
            dimClass,
            isDragging && "opacity-90 bg-surface-elevated shadow-xl rounded-lg z-50 scale-[1.02] border-primary-accent/20",
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
  );
}
