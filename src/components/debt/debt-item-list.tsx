"use client";

import { AnimatePresence } from "framer-motion";
import { LedgerItem } from "@/lib/types";
import { SortableDebtItemRow } from "./sortable-debt-item-row";
import { DebtInlineEditRow } from "./debt-inline-edit-row";

interface DebtItemListProps {
  items: LedgerItem[];
  editingId: string | null;
  onEdit: (item: LedgerItem) => void;
  onDelete: (id: string) => void;
  onStartEdit: (id: string) => void;
  onSaveEdit: (data: {
    amount: number;
    description: string;
    category: string;
    date: string;
  }) => void;
  onCancelEdit: () => void;
  currentUserId: string;
}

export function DebtItemList({
  items,
  editingId,
  onEdit,
  onDelete,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  currentUserId,
}: DebtItemListProps) {
  return (
    <div className="flex flex-col">
      <AnimatePresence mode="popLayout" initial={false}>
        {items.map((item) => {
          const isEditing = editingId === item.id;

          if (isEditing) {
            return (
              <DebtInlineEditRow
                key={item.id}
                amount={item.amount}
                description={item.description}
                category={item.category}
                date={item.date}
                onSave={onSaveEdit}
                onCancel={onCancelEdit}
              />
            );
          }

          return (
            <SortableDebtItemRow
              key={item.id}
              item={item}
              userName={item.updatedByName || "Unknown"}
              onEdit={onEdit}
              onDelete={onDelete}
              isEditing={isEditing}
              onStartEdit={() => onStartEdit(item.id)}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              isOwned={item.createdBy === currentUserId}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
