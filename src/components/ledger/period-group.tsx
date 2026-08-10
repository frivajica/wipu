"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { LedgerItem } from "@/lib/types";
import { PeriodHeader } from "./period-header";
import { LedgerItemList } from "./period/ledger-item-list";
import { useScrollTrackingContext } from "@/contexts/scroll-tracking-context";

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
  registerDragRow?: (id: string, date: string, el: HTMLElement | null) => void;
}

export function PeriodGroup({
  label,
  items,
  onEditItem,
  onDeleteItem,
  currentUserId,
  periodStats,
  registerDragRow,
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

  const { observeElement, unobserveElement, currentPeriodKey } =
    useScrollTrackingContext();

  const isActiveDateSort = sortField === "date" && sortDirection === "desc";
  const isDragEnabled = sortField === null || sortField === "date";

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

      <LedgerItemList
        items={items}
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
        registerDragRow={registerDragRow}
      />
    </motion.section>
  );
}
