"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getCurrentDate } from "@/lib/formatting";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AutocompleteInput } from "./autocomplete-input";
import { useAutocomplete } from "@/hooks/use-autocomplete";
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
  const [date, setDate] = React.useState(defaultDate || getCurrentDate());
  const amountRef = React.useRef<HTMLInputElement>(null);

  const { suggestions: descriptionSuggestions } = useAutocomplete("description", description);
  const { suggestions: categorySuggestions } = useAutocomplete("category", category);

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

  const handleKeyDown = (e: React.KeyboardEvent, nextField?: () => void) => {
    if (e.key === "Enter" && nextField) {
      e.preventDefault();
      nextField();
    }
  };

  const amountColor = amount && !isNaN(parseFloat(amount))
    ? parseFloat(amount) >= 0
      ? "text-secondary"
      : "text-error"
    : "";

  return (
    <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-border">
      <div className="grid md:grid-cols-[32px_120px_1fr_120px_100px_60px] md:gap-4 grid-cols-[32px_1fr] gap-3 items-start">
        <div className="flex items-center justify-center h-10">
          <Plus className="h-5 w-5 text-primary-accent" />
        </div>

        <Input
          ref={amountRef}
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, () => document.getElementById("desc-input")?.focus())}
          className={cn("h-10", amountColor)}
          required
        />

        <AutocompleteInput
          inputRef={undefined}
          value={description}
          onChange={setDescription}
          suggestions={descriptionSuggestions}
          placeholder="Description"
          onKeyDown={(e) => handleKeyDown(e, () => document.getElementById("cat-input")?.focus())}
          required
        />

        <AutocompleteInput
          inputRef={undefined}
          id="cat-input"
          value={category}
          onChange={setCategory}
          suggestions={categorySuggestions}
          placeholder="Category"
          onKeyDown={(e) => handleKeyDown(e, () => document.getElementById("date-input")?.focus())}
        />

        <Input
          id="date-input"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-10"
          required
        />

        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" className="h-8 px-2">
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
