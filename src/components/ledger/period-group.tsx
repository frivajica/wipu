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
  DragMoveEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { LedgerItem } from "@/lib/types";
import { PeriodHeader } from "./period-header";
import { LedgerItemList } from "./period/ledger-item-list";
import { useScrollTrackingContext } from "@/contexts/scroll-tracking-context";
import { getMidpointDate } from "@/lib/date-utils";
import { useDragDatePreview } from "@/hooks/shared/use-drag-date-preview";
import { DatePreviewPill } from "./date-preview-pill";
import { InsertionLine } from "./insertion-line";

import { ArrowUp, ArrowDown } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { SPRING_DEFAULT } from "@/lib/animations";

interface PeriodGroupProps {
  label: string;
  items: LedgerItem[];
  onAddItem: (item: Omit<LedgerItem, "id" | "createdAt" | "updatedAt">) => void;
  onEditItem: (item: LedgerItem) => void;
  onDeleteItem: (id: string) => void;
  onReorderItems: (itemIds: string[], dateUpdates?: Record<string, string>) => void;
  currentUserId: string;
  periodStats?: {
    balance: number;
    debt: number;
    runningBalance: number;
    runningDebt: number;
    displayLabel: string;
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
  periodStats,
}: PeriodGroupProps) {
  const sortField = useUIStore((s) => s.sortField);
  const sortDirection = useUIStore((s) => s.sortDirection);
  const setSort = useUIStore((s) => s.setSort);

  const handleSort = (field: "date" | "amount" | "description" | "category" | "profile") => {
    if (sortField === field) {
      setSort(field, sortDirection === "asc" ? "desc" : "asc");
    } else {
      const isText = field === "description" || field === "category" || field === "profile";
      setSort(field, isText ? "asc" : "desc");
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1 inline-block" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1 inline-block" />
    );
  };

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [optimisticItems, addOptimisticItems] = React.useOptimistic(
    items,
    (_state, newItems: LedgerItem[]) => newItems
  );

  const { pause, resume, observeElement, unobserveElement, currentPeriodKey } =
    useScrollTrackingContext();

  const {
    previewDate,
    insertionY,
    isPreviewActive,
    registerRow,
    updatePointerY,
  } = useDragDatePreview(items);

  const isActiveDateSort = sortField === "date" && sortDirection === "desc";

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = () => {
    pause();
  };

  const handleDragMove = React.useCallback((event: DragMoveEvent) => {
    if (event.activatorEvent && "clientY" in event.activatorEvent) {
      updatePointerY((event.activatorEvent as MouseEvent).clientY);
    }
  }, [updatePointerY]);

  const handleDragEnd = (event: DragEndEvent) => {
    resume();
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = optimisticItems.findIndex((item) => item.id === active.id);
      const newIndex = optimisticItems.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(optimisticItems, oldIndex, newIndex);

      const movedItem = newItems[newIndex];
      const finalDate = previewDate || getMidpointDate(
        newItems[newIndex - 1]?.date ?? movedItem.date,
        newItems[newIndex + 1]?.date ?? movedItem.date
      );
      movedItem.date = finalDate;
      const dateUpdates = { [movedItem.id]: finalDate };

      React.startTransition(() => {
        addOptimisticItems(newItems);
        onReorderItems(
          newItems.map((item) => item.id),
          dateUpdates
        );
      });
    }
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

  const isDragEnabled = sortField === null || sortField === "date";

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
      observeElement={isActiveDateSort ? observeElement : () => {}}
      unobserveElement={isActiveDateSort ? unobserveElement : () => {}}
      periodKey={label}
      registerDragRow={isDragEnabled ? registerRow : undefined}
    />
  );

  const content = isDragEnabled ? (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={displayItems.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        {list}
      </SortableContext>
    </DndContext>
  ) : list;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING_DEFAULT}
      className="mb-8"
    >
      <PeriodHeader
        label={periodStats?.displayLabel || label}
        balance={periodStats?.balance ?? 0}
        debt={periodStats?.debt ?? 0}
        runningBalance={periodStats?.runningBalance ?? 0}
        _runningDebt={periodStats?.runningDebt ?? 0}
        isActive={currentPeriodKey === label}
      />

      <div className={cn(
        "hidden md:grid gap-3 px-3 pb-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider transition-all duration-200 ease-out",
        isDragEnabled
          ? "grid-cols-[18px_100px_1fr_1fr_90px_64px_18px]"
          : "grid-cols-[0_100px_1fr_1fr_90px_64px_0]"
      )}>
        <div className="overflow-hidden"></div>
        <div className="cursor-pointer hover:text-text-secondary flex items-center" onClick={() => handleSort("amount")}>
          Amount {renderSortIcon("amount")}
        </div>
        <div className="cursor-pointer hover:text-text-secondary flex items-center" onClick={() => handleSort("description")}>
          Description {renderSortIcon("description")}
        </div>
        <div className="cursor-pointer hover:text-text-secondary flex items-center" onClick={() => handleSort("category")}>
          Category {renderSortIcon("category")}
        </div>
        <div className="cursor-pointer hover:text-text-secondary flex items-center" onClick={() => handleSort("date")}>
          Date {renderSortIcon("date")}
        </div>
        <div className="text-center cursor-pointer hover:text-text-secondary flex items-center justify-center" onClick={() => handleSort("profile")}>
          Profile {renderSortIcon("profile")}
        </div>
        <div className="overflow-hidden"></div>
      </div>

      {content}

      {isPreviewActive && (
        <>
          <DatePreviewPill date={previewDate} y={insertionY} />
          <InsertionLine y={insertionY} />
        </>
      )}
    </motion.section>
  );
}
