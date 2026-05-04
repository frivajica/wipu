"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LedgerFormFields } from "./forms/ledger-form-fields";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPRING_DEFAULT } from "@/lib/animations";

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
        "px-4 py-3.5",
        // Editing card: warm indigo tint with glow
        "rounded-xl bg-primary-accent/[0.04] border border-primary-accent/20",
        "shadow-glow-focus"
      )}
    >
      <div className="grid md:grid-cols-[120px_1fr_1fr_120px_80px] md:gap-4 grid-cols-[32px_1fr] gap-3 items-center">
        <LedgerFormFields
          amount={editAmount}
          description={editDescription}
          category={editCategory}
          date={editDate}
          onAmountChange={setEditAmount}
          onDescriptionChange={setEditDescription}
          onCategoryChange={setEditCategory}
          onDateChange={setEditDate}
          amountRef={amountRef}
          amountClassName="h-9 bg-surface"
        />

        <div className="flex items-center gap-1.5">
          <Button type="submit" size="sm" className="h-8 px-2.5">
            <Check className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.form>
  );
}
