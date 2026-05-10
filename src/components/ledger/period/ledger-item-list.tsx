"use client";

import { AnimatePresence } from "framer-motion";
import { LedgerItem } from "@/lib/types";
import { SortableLedgerRow } from "../row/sortable-ledger-row";
import { InlineEditRow } from "../inline-edit-row";

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
  includesDebt: boolean;
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
  includesDebt,
}: LedgerItemListProps) {
  return (
    <div className="flex flex-col gap-1.5">
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
              isDimmed={item.type === "debt" && !includesDebt}
              isDragEnabled={isDragEnabled}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
