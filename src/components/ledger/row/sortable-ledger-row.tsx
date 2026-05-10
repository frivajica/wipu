"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LedgerItem } from "@/lib/types";
import { LedgerRow } from "../row/ledger-row";
import { InlineEditRow } from "../inline-edit-row";

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
  isDimmed?: boolean;
  isDragEnabled?: boolean;
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
  isDimmed,
  isDragEnabled = true,
}: SortableLedgerRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style}>
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
    <div ref={setNodeRef} style={style}>
      <LedgerRow
        item={item}
        userName={userName}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandleProps={isDragEnabled ? { ...attributes, ...listeners } : undefined}
        isDragging={isDragging}
        onStartEdit={onStartEdit}
        isOwned={isOwned}
        isDimmed={isDimmed}
        isDragEnabled={isDragEnabled}
      />
    </div>
  );
}
