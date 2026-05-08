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
import { DebtGroup, LedgerItem } from "@/lib/types";
import { formatCurrency } from "@/lib/formatting";
import { useLedger } from "@/hooks/use-ledger";
import { DebtItemList } from "./debt-item-list";
import { AddDebtItemRow } from "./add-debt-item-row";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";
import { SPRING_DEFAULT } from "@/lib/animations";

interface DebtGroupCardProps {
  group: DebtGroup;
  currentUserId: string;
  onEditItem: (item: LedgerItem) => void;
  onDeleteItem: (id: string) => void;
  onReorderItems: (itemIds: string[]) => void;
}

export function DebtGroupCard({
  group,
  currentUserId,
  onEditItem,
  onDeleteItem,
  onReorderItems,
}: DebtGroupCardProps) {
  const { items, addItem } = useLedger();
  const groupItems = items.filter(
    (item) => item.type === "debt" && item.groupId === group.id
  );
  const balance = groupItems.reduce((sum, item) => sum + item.amount, 0);

  const [isAdding, setIsAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [optimisticItems, addOptimisticItems] = React.useOptimistic(
    groupItems,
    (_state, newItems: LedgerItem[]) => newItems
  );

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
      const oldIndex = optimisticItems.findIndex((item) => item.id === active.id);
      const newIndex = optimisticItems.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(optimisticItems, oldIndex, newIndex);
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
    addItem({
      ...data,
      spaceId: group.spaceId,
      createdBy: currentUserId,
      updatedBy: currentUserId,
      sortOrder: groupItems.length,
      type: "debt",
      groupId: group.id,
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
      const item = groupItems.find((i) => i.id === editingId);
      if (item) {
        onEditItem({ ...item, ...data, updatedBy: currentUserId });
      }
      setEditingId(null);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-l-xl"
        style={{ backgroundColor: group.color }}
      />

      <div className="flex items-center justify-between p-4 pl-5">
        <div>
          <h3 className="text-base font-semibold text-text">{group.name}</h3>
          <p className="text-xs text-text-secondary">
            {groupItems.length} {groupItems.length === 1 ? "item" : "items"}
          </p>
        </div>
        <span
          className={cn(
            "text-sm md:text-base font-bold",
            balance > 0 ? "text-danger" : "text-success"
          )}
        >
          {formatCurrency(balance)}
        </span>
      </div>

      <div className="border-t border-border/40 px-3 py-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={optimisticItems.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <DebtItemList
              items={optimisticItems}
              editingId={editingId}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
              onStartEdit={setEditingId}
              onSaveEdit={handleEditSave}
              onCancelEdit={() => setEditingId(null)}
              currentUserId={currentUserId}
            />
          </SortableContext>
        </DndContext>

        <AnimatePresence>
          {isAdding ? (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 8 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={SPRING_DEFAULT}
            >
              <AddDebtItemRow
                onSubmit={handleAdd}
                onCancel={() => setIsAdding(false)}
                defaultDate={groupItems[groupItems.length - 1]?.date}
              />
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(true)}
              className={cn(
                "w-full mt-2 py-2 px-3 flex items-center justify-center gap-1.5 text-xs font-medium cursor-pointer",
                "rounded-lg bg-surface border border-border/40 border-dashed",
                "text-text-tertiary hover:text-primary-accent hover:border-primary-accent/30 hover:bg-primary-accent/2",
                "transition-all duration-200 ease-out"
              )}
            >
              <Plus className="h-3.5 w-3.5" />
              Add to {group.name}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
