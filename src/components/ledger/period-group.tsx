"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LedgerItem } from "@/lib/types";
import { PeriodHeader } from "./period-header";
import { LedgerRow } from "./ledger-row";
import { InlineEditRow } from "./inline-edit-row";
import { AddItemRow } from "./add-item-row";
import { getPeriodBalance } from "@/lib/utils";
import { mockDb } from "@/lib/data";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

function SortableLedgerRow({
  item,
  userName,
  onEdit,
  onDelete,
  isEditing,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  isOwned,
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
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
        onStartEdit={onStartEdit}
        isOwned={isOwned}
      />
    </div>
  );
}

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
  const [localItems, setLocalItems] = React.useState(items);
  const balance = getPeriodBalance(items);

  React.useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        onReorderItems(newItems.map((item) => item.id));
        return newItems;
      });
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
        onEditItem({
          ...item,
          ...data,
          updatedBy: currentUserId,
        });
      }
      setEditingId(null);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
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
              items={localItems.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="divide-y divide-border/50">
                <AnimatePresence mode="popLayout" initial={false}>
                  {localItems.map((item) => {
                    const user = mockDb.getUserById(item.updatedBy);
                    return (
                      <SortableLedgerRow
                        key={item.id}
                        item={item}
                        userName={user?.name || "Unknown"}
                        onEdit={onEditItem}
                        onDelete={onDeleteItem}
                        isEditing={editingId === item.id}
                        onStartEdit={() => setEditingId(item.id)}
                        onSaveEdit={handleEditSave}
                        onCancelEdit={() => setEditingId(null)}
                        isOwned={item.createdBy === currentUserId}
                      />
                    );
                  })}
                </AnimatePresence>
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="divide-y divide-border/50">
            <AnimatePresence mode="popLayout" initial={false}>
              {localItems.map((item) => {
                const user = mockDb.getUserById(item.updatedBy);
                
                if (editingId === item.id) {
                  return (
                    <InlineEditRow
                      key={item.id}
                      amount={item.amount}
                      description={item.description}
                      category={item.category}
                      date={item.date}
                      onSave={handleEditSave}
                      onCancel={() => setEditingId(null)}
                    />
                  );
                }
                
                return (
                  <LedgerRow
                    key={item.id}
                    item={item}
                    userName={user?.name || "Unknown"}
                    onEdit={onEditItem}
                    onDelete={onDeleteItem}
                    isEditing={editingId === item.id}
                    onStartEdit={() => setEditingId(item.id)}
                    isOwned={item.createdBy === currentUserId}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Add Item */}
        <AnimatePresence>
          {isAdding ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
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
                "w-full py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium",
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
