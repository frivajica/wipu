"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { LedgerItem } from "@/lib/types";
import { PeriodHeader } from "./period-header";
import { AddItemRow } from "./add-item-row";
import { LedgerItemList } from "./period/ledger-item-list";
import { getPeriodBalance } from "@/lib/grouping";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";

interface PeriodGroupProps {
  label: string;
  items: LedgerItem[];
  onAddItem: (item: Omit<LedgerItem, "id" | "createdAt" | "updatedAt">) => void;
  onEditItem: (item: LedgerItem) => void;
  onDeleteItem: (id: string) => void;
  onReorderItems: (itemIds: string[]) => void;
  currentUserId: string;
  isDragEnabled: boolean;
}

export function PeriodGroup({
  label,
  items,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onReorderItems,
  currentUserId,
  isDragEnabled,
}: PeriodGroupProps) {
  const [isAdding, setIsAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [optimisticItems, addOptimisticItems] = React.useOptimistic(
    items,
    (_state, newItems: LedgerItem[]) => newItems
  );
  const balance = getPeriodBalance(items);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      addOptimisticItems(newItems);
      onReorderItems(newItems.map((item) => item.id));
    }
  };

  const handleAdd = (data: {
    amount: number;
    description: string;
    category: string;
    date: string;
  }) => {
    onAddItem({
      ...data,
      spaceId: items[0]?.spaceId || "",
      createdBy: currentUserId,
      updatedBy: currentUserId,
      sortOrder: items.length,
    });
    setIsAdding(false);
  };

  const handleEditSave = (data: {
    amount: number;
    description: string;
    category: string;
    date: string;
  }) => {
    if (editingId) {
      const item = items.find((i) => i.id === editingId);
      if (item) {
        onEditItem({ ...item, ...data, updatedBy: currentUserId });
      }
      setEditingId(null);
    }
  };

  const displayItems = optimisticItems;

  const list = (
    <LedgerItemList
      items={displayItems}
      editingId={editingId}
      onEdit={onEditItem}
      onDelete={onDeleteItem}
      onStartEdit={setEditingId}
      onSaveEdit={handleEditSave}
      onCancelEdit={() => setEditingId(null)}
      currentUserId={currentUserId}
      isDragEnabled={isDragEnabled}
    />
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring" as const, stiffness: 400, damping: 35 }}
      className="mb-8"
    >
      <PeriodHeader label={label} balance={balance} />

      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
        {/* Desktop Headers */}
        <div className="hidden md:grid grid-cols-[32px_120px_1fr_120px_100px_60px] gap-4 px-4 py-2 bg-surface-elevated border-b border-border text-xs font-medium text-text-secondary uppercase tracking-wider">
          <div></div>
          <div>Amount</div>
          <div>Description</div>
          <div>Category</div>
          <div>Date</div>
          <div className="text-center">Profile</div>
        </div>

        {/* Items */}
        {isDragEnabled ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={displayItems.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {list}
            </SortableContext>
          </DndContext>
        ) : (
          list
        )}

        {/* Add Item */}
        <AnimatePresence>
          {isAdding ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 35 }}
            >
              <AddItemRow
                onSubmit={handleAdd}
                onCancel={() => setIsAdding(false)}
                defaultDate={items[items.length - 1]?.date}
              />
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(true)}
              className={cn(
                "w-full py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium cursor-pointer",
                "text-primary-accent hover:bg-surface-elevated transition-colors",
                "border-t border-border"
              )}
            >
              <Plus className="h-4 w-4" />
              Add to {label}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
