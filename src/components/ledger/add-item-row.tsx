"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LedgerFormFields } from "./forms/ledger-form-fields";
import { Plus, X } from "lucide-react";

interface AddItemRowProps {
  onSubmit: (item: {
    amount: number;
    description: string;
    category: string;
    date: string;
  }) => void;
  onCancel: () => void;
  defaultDate?: string;
}

export function AddItemRow({ onSubmit, onCancel, defaultDate }: AddItemRowProps) {
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

  const handleKeyDown = (e: React.KeyboardEvent, nextFieldId?: string) => {
    if (e.key === "Enter" && nextFieldId) {
      e.preventDefault();
      document.getElementById(nextFieldId)?.focus();
    }
  };

  const amountColor = amount && !isNaN(parseFloat(amount))
    ? parseFloat(amount) >= 0
      ? "text-secondary"
      : "text-error"
    : "";

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "px-4 py-3.5",
        // Distinctive "new row" card styling
        "rounded-xl bg-primary-accent/[0.03] border border-primary-accent/15",
        "shadow-card"
      )}
    >
      <div className="grid md:grid-cols-[32px_120px_1fr_120px_100px_60px] md:gap-4 grid-cols-[32px_1fr] gap-3 items-start">
        <div className="flex items-center justify-center h-10">
          <div className="h-8 w-8 rounded-lg bg-primary-accent/10 flex items-center justify-center">
            <Plus className="h-4 w-4 text-primary-accent" />
          </div>
        </div>

        <LedgerFormFields
          amount={amount}
          description={description}
          category={category}
          date={date}
          onAmountChange={setAmount}
          onDescriptionChange={setDescription}
          onCategoryChange={setCategory}
          onDateChange={setDate}
          onKeyDown={handleKeyDown}
          amountRef={amountRef}
          amountClassName={cn("h-10 bg-surface", amountColor)}
        />

        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" className="h-8 px-3">
            Add
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
