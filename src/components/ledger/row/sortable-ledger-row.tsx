"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LedgerItem } from "@/lib/types";
import { LedgerRow } from "./ledger-row";
import { InlineEditRow } from "../inline-edit-row";
import { useScrollTrackingContext } from "@/contexts/scroll-tracking-context";

interface SortableLedgerRowProps {
  item: LedgerItem;
  userName: string;
  onEdit: (item: LedgerItem) => void;
  onDelete: (id: string) => void;
  isEditing: boolean;
  onStartEdit: () => void;
  onSaveEdit: (data: {
    amount: number;
    description: string;
    category: string;
    date: string;
  }) => void;
  onCancelEdit: () => void;
  isOwned: boolean;
  isDragEnabled?: boolean;
  observeElement: (
    el: HTMLElement,
    itemId: string,
    amount: number,
    type: string,
    periodKey: string,
    date: string
  ) => void;
  unobserveElement: (el: HTMLElement) => void;
  periodKey: string;
  date: string;
  registerDragRow?: (id: string, date: string, el: HTMLElement | null, periodKey: string) => void;
}

export function SortableLedgerRow({
  item,
  userName,
  onEdit,
  onDelete,
  isEditing,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  isOwned,
  isDragEnabled = true,
  observeElement,
  unobserveElement,
  periodKey,
  date,
  registerDragRow,
}: SortableLedgerRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const { activeItemId } = useScrollTrackingContext();

  const rowRef = React.useRef<HTMLElement | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  React.useEffect(() => {
    const el = rowRef.current;
    if (el && !isEditing) {
      observeElement(el, item.id, item.amount, item.type, periodKey, date);
      registerDragRow?.(item.id, item.date, el, periodKey);
      return () => {
        unobserveElement(el);
        registerDragRow?.(item.id, item.date, null, periodKey);
      };
    }
  }, [item.id, item.amount, item.type, periodKey, date, isEditing, observeElement, unobserveElement, registerDragRow]);

  if (isEditing) {
    return (
    <div ref={(node) => { setNodeRef(node); rowRef.current = node; }} style={style}>
        <InlineEditRow
          amount={item.amount}
          description={item.description}
          category={item.category}
          date={item.date}
          onSave={onSaveEdit}
          onCancel={onCancelEdit}
        />
      </div>
    );
  }

  return (
    <div ref={(node) => { setNodeRef(node); rowRef.current = node; }} style={style}>
      <LedgerRow
        item={item}
        userName={userName}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandleProps={isDragEnabled ? { ...attributes, ...listeners } : undefined}
        isDragging={isDragging}
        onStartEdit={onStartEdit}
        isOwned={isOwned}
        isDragEnabled={isDragEnabled}
        isActive={item.id === activeItemId}
      />
    </div>
  );
}
