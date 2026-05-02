"use client";

import * as React from "react";
import { cn, formatDate, getCurrentDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface InlineEditRowProps {
  amount: number;
  description: string;
  category: string;
  date: string;
  onSave: (data: {
    amount: number;
    description: string;
    category: string;
    date: string;
  }) => void;
  onCancel: () => void;
}

export function InlineEditRow({
  amount,
  description,
  category,
  date,
  onSave,
  onCancel,
}: InlineEditRowProps) {
  const [editAmount, setEditAmount] = React.useState(amount.toString());
  const [editDescription, setEditDescription] = React.useState(description);
  const [editCategory, setEditCategory] = React.useState(category);
  const [editDate, setEditDate] = React.useState(date);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(editAmount);
    if (isNaN(numAmount) || !editDescription.trim()) return;

    onSave({
      amount: numAmount,
      description: editDescription.trim(),
      category: editCategory.trim() || "Uncategorized",
      date: editDate,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="px-4 py-3 bg-primary-accent/5 border-y border-primary-accent/20"
    >
      <div className="grid md:grid-cols-[32px_120px_1fr_120px_100px_80px] md:gap-4 grid-cols-[32px_1fr] gap-3 items-center">
        <div></div>

        <Input
          type="number"
          step="0.01"
          value={editAmount}
          onChange={(e) => setEditAmount(e.target.value)}
          className="h-9"
          required
        />

        <Input
          type="text"
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="h-9"
          required
        />

        <Input
          type="text"
          value={editCategory}
          onChange={(e) => setEditCategory(e.target.value)}
          className="h-9"
        />

        <Input
          type="date"
          value={editDate}
          onChange={(e) => setEditDate(e.target.value)}
          className="h-9"
          required
        />

        <div className="flex items-center gap-1">
          <Button type="submit" size="sm" className="h-8 px-2">
            <Check className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
