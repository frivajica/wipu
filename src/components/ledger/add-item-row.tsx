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
      <div className="grid md:grid-cols-[120px_1fr_1fr_120px_80px] md:gap-4 grid-cols-[32px_1fr] gap-3 items-start">
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
          <button
            type="submit"
            className={cn(
              "h-9 w-9 flex items-center justify-center rounded-xl",
              "bg-primary-accent text-white shadow-card",
              "hover:bg-primary-accent-hover hover:shadow-card-hover hover:-translate-y-px",
              "active:scale-[0.97] active:shadow-inner-active",
              "transition-all duration-200 ease-out",
              "focus-visible:outline-none focus-visible:shadow-glow-focus cursor-pointer"
            )}
            aria-label="Add transaction"
          >
            <Plus className="h-5 w-5" />
          </button>
          <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
