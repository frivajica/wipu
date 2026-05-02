"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { AutocompleteInput } from "../autocomplete-input";
import { useAutocomplete } from "@/hooks/use-autocomplete";

interface LedgerFormFieldsProps {
  amount: string;
  description: string;
  category: string;
  date: string;
  onAmountChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent, nextFieldId?: string) => void;
  amountRef?: React.Ref<HTMLInputElement>;
  amountClassName?: string;
}

export function LedgerFormFields({
  amount,
  description,
  category,
  date,
  onAmountChange,
  onDescriptionChange,
  onCategoryChange,
  onDateChange,
  onKeyDown,
  amountRef,
  amountClassName,
}: LedgerFormFieldsProps) {
  const { suggestions: descSuggestions } = useAutocomplete("description", description);
  const { suggestions: catSuggestions } = useAutocomplete("category", category);

  return (
    <>
      <Input
        ref={amountRef}
        type="number"
        step="0.01"
        placeholder="Amount"
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
        onKeyDown={(e) => onKeyDown?.(e, "desc-input")}
        className={amountClassName}
        required
      />

      <AutocompleteInput
        id="desc-input"
        value={description}
        onChange={onDescriptionChange}
        suggestions={descSuggestions}
        placeholder="Description"
        onKeyDown={(e) => onKeyDown?.(e, "cat-input")}
        required
      />

      <AutocompleteInput
        id="cat-input"
        value={category}
        onChange={onCategoryChange}
        suggestions={catSuggestions}
        placeholder="Category"
        onKeyDown={(e) => onKeyDown?.(e, "date-input")}
      />

      <Input
        id="date-input"
        type="date"
        value={date}
        onChange={(e) => onDateChange(e.target.value)}
        required
      />
    </>
  );
}
