"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPRING_DEFAULT } from "@/lib/animations";

interface AddDebtItemRowProps {
  onSubmit: (item: {
    amount: number;
    description: string;
    category: string;
    date: string;
  }) => void;
  onCancel: () => void;
  defaultDate?: string;
}

export function AddDebtItemRow({ onSubmit, onCancel, defaultDate }: AddDebtItemRowProps) {
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [date, setDate] = React.useState(defaultDate || "");
  const amountRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    amountRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || !description.trim()) return;

    onSubmit({
      amount: numAmount,
      description: description.trim(),
      category: category.trim() || "Uncategorized",
      date,
    });
  };

  const amountColor = amount && !isNaN(parseFloat(amount))
    ? parseFloat(amount) >= 0
      ? "text-danger"
      : "text-success"
    : "";

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={SPRING_DEFAULT}
      onSubmit={handleSubmit}
      className={cn(
        "px-2 py-2 rounded-lg bg-primary-accent/3 border border-primary-accent/15"
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Input
          ref={amountRef}
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={cn("w-24 h-8 text-sm", amountColor)}
          required
        />
        <Input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1 min-w-[100px] h-8 text-sm"
          required
        />
        <Input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-28 h-8 text-sm"
        />
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-32 h-8 text-sm"
          required
        />
        <div className="flex items-center gap-1">
          <button
            type="submit"
            className={cn(
              "h-7 w-7 flex items-center justify-center rounded-md",
              "bg-primary-accent text-white",
              "hover:bg-primary-accent-hover",
              "active:scale-[0.97]",
              "transition-all duration-150",
              "focus-visible:outline-none focus-visible:shadow-glow-focus cursor-pointer"
            )}
            aria-label="Add debt item"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <Button type="button" variant="ghost" size="sm" className="h-7 px-1.5" onClick={onCancel}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </motion.form>
  );
}
