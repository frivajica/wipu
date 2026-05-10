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

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";
import { SPRING_DEFAULT } from "@/lib/animations";

interface PeriodGroupProps {
  label: string;
  items: LedgerItem[];
  onAddItem: (item: Omit<LedgerItem, "id" | "createdAt" | "updatedAt">) => void;
  onEditItem: (item: LedgerItem) => void;
  onDeleteItem: (id: string) => void;
  onReorderItems: (itemIds: string[]) => void;
  currentUserId: string;
  isDragEnabled: boolean;
  includesDebt: boolean;
  periodStats?: {
    balance: number;
    debt: number;
    runningBalance: number;
    runningDebt: number;
  };
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
  includesDebt,
  periodStats,
}: PeriodGroupProps) {
  const [isAdding, setIsAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [optimisticItems, addOptimisticItems] = React.useOptimistic(
    items,
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
      React.startTransition(() => {
        addOptimisticItems(newItems);
        onReorderItems(newItems.map((item) => item.id));
      });
    }
  };

  const handleAdd = (data: {
    amount: number;
    description: string;
    category: string;
    date: string;
    type?: "default" | "debt";
    groupId?: string | null;
  }) => {
    onAddItem({
      ...data,
      spaceId: items[0]?.spaceId || "",
      createdBy: currentUserId,
      updatedBy: currentUserId,
      sortOrder: items.length,
      type: data.type || "default",
      groupId: data.groupId || null,
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
      includesDebt={includesDebt}
    />
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING_DEFAULT}
      className="mb-8"
    >
      <PeriodHeader
        label={label}
        balance={periodStats?.balance ?? 0}
        debt={periodStats?.debt ?? 0}
        runningBalance={periodStats?.runningBalance ?? 0}
        runningDebt={periodStats?.runningDebt ?? 0}
        includesDebt={includesDebt}
      />

      <div className="hidden md:grid grid-cols-[28px_100px_1fr_1fr_90px_64px] gap-3 px-3 pb-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
        <div></div>
        <div>Amount</div>
        <div>Description</div>
        <div>Category</div>
        <div>Date</div>
        <div className="text-center">Profile</div>
      </div>

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

      <AnimatePresence>
        {isAdding ? (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 8 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={SPRING_DEFAULT}
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
              "w-full mt-2 py-2.5 px-3 flex items-center justify-center gap-2 text-sm font-medium cursor-pointer",
              "rounded-xl bg-surface border border-border/40 border-dashed",
              "text-text-tertiary hover:text-primary-accent hover:border-primary-accent/30 hover:bg-primary-accent/2",
              "transition-all duration-200 ease-out"
            )}
          >
            <Plus className="h-4 w-4" />
            Add to {label}
          </motion.button>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
