"use client";

import * as React from "react";
import { LedgerItem } from "@/lib/types";
import { PeriodHeader } from "./period-header";
import { LedgerRow } from "./ledger-row";
import { AddItemRow } from "./add-item-row";
import { cn, getPeriodBalance } from "@/lib/utils";
import { mockDb } from "@/lib/data.js";
import { Plus } from "lucide-react";

interface PeriodGroupProps {
  label: string;
  items: LedgerItem[];
  onAddItem: (item: Omit<LedgerItem, "id" | "createdAt" | "updatedAt">) => void;
  onEditItem: (item: LedgerItem) => void;
  onDeleteItem: (id: string) => void;
  currentUserId: string;
}

export function PeriodGroup({
  label,
  items,
  onAddItem,
  onEditItem,
  onDeleteItem,
  currentUserId,
}: PeriodGroupProps) {
  const [isAdding, setIsAdding] = React.useState(false);
  const balance = getPeriodBalance(items);

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

  return (
    <section className="mb-8">
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
        <div className="divide-y divide-border/50">
          {items.map((item) => {
            const user = mockDb.getUserById(item.updatedBy);
            return (
              <LedgerRow
                key={item.id}
                item={item}
                userName={user?.name || "Unknown"}
                onEdit={onEditItem}
                onDelete={onDeleteItem}
              />
            );
          })}
        </div>

        {/* Add Item */}
        {isAdding ? (
          <AddItemRow
            onSubmit={handleAdd}
            onCancel={() => setIsAdding(false)}
            defaultDate={items[items.length - 1]?.date}
          />
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className={cn(
              "w-full py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium",
              "text-primary-accent hover:bg-surface-elevated transition-colors",
              "border-t border-border"
            )}
          >
            <Plus className="h-4 w-4" />
            Add to {label}
          </button>
        )}
      </div>
    </section>
  );
}
