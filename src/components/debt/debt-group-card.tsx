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
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";
import { SPRING_DEFAULT } from "@/lib/animations";

interface DebtGroupCardProps {
  group: DebtGroup;
  currentUserId: string;
  onEditItem: (item: LedgerItem) => void;
  onDeleteItem: (id: string) => void;
  onReorderItems: (itemIds: string[]) => void;
  onUpdateGroup: (id: string, name: string) => Promise<void>;
  onDeleteGroup: (id: string) => Promise<void>;
}

export function DebtGroupCard({
  group,
  currentUserId,
  onEditItem,
  onDeleteItem,
  onReorderItems,
  onUpdateGroup,
  onDeleteGroup,
}: DebtGroupCardProps) {
  const { items, addItem } = useLedger();
  const groupItems = items.filter(
    (item) => item.type === "debt" && item.groupId === group.id
  );
  const balance = groupItems.reduce((sum, item) => sum + item.amount, 0);

  const [isAdding, setIsAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editName, setEditName] = React.useState(group.name);
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

  const handleUpdateName = async () => {
    if (!editName.trim() || editName.trim() === group.name) {
      setIsEditingName(false);
      return;
    }
    await onUpdateGroup(group.id, editName.trim());
    setIsEditingName(false);
  };

  const handleDelete = async () => {
    if (confirm(`Delete "${group.name}"? This cannot be undone.`)) {
      await onDeleteGroup(group.id);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-l-xl"
        style={{ backgroundColor: group.color }}
      />

      <div className="flex items-center justify-between p-4 pl-5">
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdateName();
                  if (e.key === "Escape") setIsEditingName(false);
                }}
                autoFocus
                className="flex-1 min-w-0 px-2 py-1 text-sm font-semibold text-text bg-surface-strong border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-accent"
              />
              <button
                onClick={handleUpdateName}
                className="p-1 rounded-md text-success hover:bg-success/10"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsEditingName(false)}
                className="p-1 rounded-md text-text-tertiary hover:bg-surface-strong"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-text truncate">{group.name}</h3>
              <button
                onClick={() => setIsEditingName(true)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-text-tertiary hover:text-text-secondary hover:bg-surface-strong transition-opacity"
                title="Edit name"
              >
                <Pencil className="h-3 w-3" />
              </button>
            </div>
          )}
          <p className="text-xs text-text-secondary">
            {groupItems.length} {groupItems.length === 1 ? "item" : "items"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              "text-sm md:text-base font-bold",
              balance > 0 ? "text-danger" : "text-success"
            )}
          >
            {formatCurrency(balance)}
          </span>
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-text-tertiary hover:text-error hover:bg-error/10 transition-opacity"
            title="Delete group"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
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
