"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LedgerFormFields } from "./forms/ledger-form-fields";
import { GroupSelector } from "./group-selector";
import { Plus, X } from "lucide-react";
import { useDebtAutocomplete } from "@/hooks/use-debt-autocomplete";
import { useDebtItemLookup } from "@/hooks/use-debt-item-lookup";
import { useDebtCategorySync } from "@/hooks/use-debt-category-sync";
import { LedgerItem } from "@/lib/types";

interface AddItemRowProps {
  onSubmit: (item: {
    amount: number;
    description: string;
    category: string;
    date: string;
    type: "default" | "debt";
    groupId: string | null;
  }) => void;
  onCancel: () => void;
  defaultDate?: string;
}

export function AddItemRow({ onSubmit, onCancel, defaultDate }: AddItemRowProps) {
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [date, setDate] = React.useState(defaultDate || "");
  const [groupId, setGroupId] = React.useState("default");
  const [itemType, setItemType] = React.useState<"default" | "debt">("default");
  const [originalDebtItem, setOriginalDebtItem] = React.useState<LedgerItem | undefined>();
  const amountRef = React.useRef<HTMLInputElement>(null);

  const { suggestions: debtSuggestions } = useDebtAutocomplete(
    itemType === "debt" ? description : ""
  );
  const { findDebtItem } = useDebtItemLookup();
  const { syncCategory } = useDebtCategorySync();

  React.useEffect(() => {
    amountRef.current?.focus();
  }, []);

  const handleDescriptionChange = async (value: string) => {
    setDescription(value);

    if (itemType === "debt") {
      const existing = await findDebtItem(value);
      if (existing) {
        setOriginalDebtItem(existing);
        setCategory(existing.category);
        setGroupId(existing.groupId || "debt-default");
        if (amount === "") {
          setAmount(String(-existing.amount));
        }
        if (date === "") {
          setDate(defaultDate || existing.date);
        }
      } else {
        setOriginalDebtItem(undefined);
      }
    }
  };

  const handleGroupChange = (newGroupId: string, newType: "default" | "debt") => {
    setGroupId(newGroupId);
    setItemType(newType);
    if (newType !== "debt") {
      setOriginalDebtItem(undefined);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || !description.trim()) return;

    const submittedCategory = category.trim() || "Uncategorized";

    if (
      originalDebtItem &&
      submittedCategory !== originalDebtItem.category
    ) {
      await syncCategory(description.trim(), submittedCategory);
    }

    onSubmit({
      amount: numAmount,
      description: description.trim(),
      category: submittedCategory,
      date,
      type: itemType,
      groupId: itemType === "debt" ? groupId : null,
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
        "px-3 py-2.5",
        "rounded-xl bg-primary-accent/3 border border-primary-accent/15",
        "shadow-card"
      )}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <GroupSelector value={groupId} onChange={handleGroupChange} />
        {itemType === "debt" && debtSuggestions.length > 0 && (
          <div className="flex gap-1">
            {debtSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleDescriptionChange(s)}
                className={cn(
                  "px-2 py-1 text-xs rounded-md",
                  "bg-debt-light/50 text-debt hover:bg-debt-light",
                  "transition-colors duration-150"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-[100px_1fr_1fr_100px_64px] md:gap-3 grid-cols-[28px_1fr] gap-2 items-start">
        <LedgerFormFields
          amount={amount}
          description={description}
          category={category}
          date={date}
          onAmountChange={setAmount}
          onDescriptionChange={handleDescriptionChange}
          onCategoryChange={setCategory}
          onDateChange={setDate}
          onKeyDown={handleKeyDown}
          amountRef={amountRef}
          amountClassName={cn("h-9 bg-surface", amountColor)}
        />

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className={cn(
              "h-8 w-8 flex items-center justify-center rounded-lg",
              "bg-primary-accent text-white shadow-card",
              "hover:bg-primary-accent-hover hover:shadow-card-hover hover:-translate-y-px",
              "active:scale-[0.97] active:shadow-inner-active",
              "transition-all duration-200 ease-out",
              "focus-visible:outline-none focus-visible:shadow-glow-focus cursor-pointer"
            )}
            aria-label="Add transaction"
          >
            <Plus className="h-4 w-4" />
          </button>
          <Button type="button" variant="ghost" size="sm" className="h-7 px-2" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
