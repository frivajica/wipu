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
  registerDragRow?: (id: string, date: string, el: HTMLElement | null, periodKey: string) => void;
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
  observeElement,
  unobserveElement,
  periodKey,
  registerDragRow,
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
              isDragEnabled={isDragEnabled}
              observeElement={observeElement}
              unobserveElement={unobserveElement}
              periodKey={periodKey}
              date={item.date}
              registerDragRow={registerDragRow}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
