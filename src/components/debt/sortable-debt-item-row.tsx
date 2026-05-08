"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LedgerItem } from "@/lib/types";
import { DebtItemRow } from "./debt-item-row";
import { DebtInlineEditRow } from "./debt-inline-edit-row";

interface SortableDebtItemRowProps {
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
}

export function SortableDebtItemRow({
  item,
  userName,
  onDelete,
  isEditing,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
}: SortableDebtItemRowProps) {
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
        <DebtInlineEditRow
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
      <DebtItemRow
        item={item}
        userName={userName}
        onClick={onStartEdit}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
}
