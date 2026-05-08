"use client";

import { AnimatePresence } from "framer-motion";
import { LedgerItem } from "@/lib/types";
import { SortableLedgerRow } from "../row/sortable-ledger-row";
import { InlineEditRow } from "../inline-edit-row";
import { LedgerRow } from "../row/ledger-row";

interface LedgerItemListProps {
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
  isDragEnabled: boolean;
}

export function LedgerItemList({
  items,
  editingId,
  onEdit,
  onDelete,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  currentUserId,
  isDragEnabled,
}: LedgerItemListProps) {
  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence mode="popLayout" initial={false}>
        {items.map((item) => {
          const isEditing = editingId === item.id;

          if (!isDragEnabled && isEditing) {
            return (
              <InlineEditRow
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

          if (isDragEnabled) {
            return (
              <SortableLedgerRow
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
          }

          return (
            <LedgerRow
              key={item.id}
              item={item}
              userName={item.updatedByName || "Unknown"}
              onEdit={onEdit}
              onDelete={onDelete}
              isEditing={isEditing}
              onStartEdit={() => onStartEdit(item.id)}
              isOwned={item.createdBy === currentUserId}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
