"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPRING_DEFAULT } from "@/lib/animations";

interface DebtInlineEditRowProps {
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

export function DebtInlineEditRow({
  amount,
  description,
  category,
  date,
  onSave,
  onCancel,
}: DebtInlineEditRowProps) {
  const [editAmount, setEditAmount] = React.useState(amount.toString());
  const [editDescription, setEditDescription] = React.useState(description);
  const [editCategory, setEditCategory] = React.useState(category);
  const [editDate, setEditDate] = React.useState(date);
  const amountRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => amountRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

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
    if (e.key === "Escape") onCancel();
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={SPRING_DEFAULT}
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className={cn(
        "px-2 py-2 rounded-lg bg-primary-accent/4 border border-primary-accent/20"
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Input
          ref={amountRef}
          type="number"
          step="0.01"
          value={editAmount}
          onChange={(e) => setEditAmount(e.target.value)}
          className="w-24 h-8 text-sm"
          required
        />
        <Input
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="flex-1 min-w-[100px] h-8 text-sm"
          required
        />
        <Input
          value={editCategory}
          onChange={(e) => setEditCategory(e.target.value)}
          className="w-28 h-8 text-sm"
        />
        <Input
          type="date"
          value={editDate}
          onChange={(e) => setEditDate(e.target.value)}
          className="w-32 h-8 text-sm"
          required
        />
        <div className="flex items-center gap-1">
          <Button type="submit" size="sm" className="h-7 px-2">
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-7 px-2" onClick={onCancel}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </motion.form>
  );
}
