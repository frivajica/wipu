"use client";

import * as React from "react";
import { LedgerItem } from "@/lib/types";
import { LedgerRowContent } from "./ledger-row-content";
import { DragHandle } from "../drag-handle";
import { SwipeToDelete } from "../swipe-to-delete";
import { RowContextMenu } from "../row-context-menu";
import { useMediaQuery } from "@/hooks/shared/use-media-query";
import { cn } from "@/lib/utils";

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
}: LedgerRowProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const handleClick = () => {
    if (!isEditing && onStartEdit) onStartEdit();
  };

  // SSR / initial hydration: render both (CSS hides the wrong one)
  // After hydration: render only the matching variant
  if (isDesktop === null) {
    return (
      <>
        {/* Mobile */}
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
                "rounded-lg bg-surface border border-border/40",
                "shadow-card active:shadow-inner-active",
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

        {/* Desktop */}
        <RowContextMenu
          onDelete={() => onDelete(item.id)}
          requiresConfirmation={!isOwned}
        >
          <div
            className={cn(
              "group hidden md:grid items-center transition-all duration-200 ease-out",
              "grid-cols-[32px_120px_1fr_1fr_100px_80px] gap-4 px-4 py-3",
              "rounded-lg bg-surface border border-border/40",
              "shadow-card hover:shadow-card-hover hover:border-border-hover",
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
            "rounded-lg bg-surface border border-border/40",
            "shadow-card hover:shadow-card-hover hover:border-border-hover",
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
            "rounded-lg bg-surface border border-border/40",
            "shadow-card active:shadow-inner-active",
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
