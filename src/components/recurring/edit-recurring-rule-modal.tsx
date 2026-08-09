"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  RecurringRuleFormFields,
  RecurringRuleFormValues,
} from "./recurring-rule-form-fields";
import { RecurringRule, RecurringRuleUpdate } from "@/hooks/use-recurring";

interface EditRecurringRuleModalProps {
  rule: RecurringRule | null;
  onClose: () => void;
  onUpdate: (id: string, payload: RecurringRuleUpdate) => Promise<unknown>;
  isUpdating: boolean;
}

function toFormValues(rule: RecurringRule): RecurringRuleFormValues {
  return {
    amount: String(rule.amount),
    description: rule.description,
    category: rule.category,
    frequencyUnit: rule.frequencyUnit,
    intervalCount: String(rule.intervalCount),
    startDate: rule.startDate,
  };
}

export function EditRecurringRuleModal({
  rule,
  onClose,
  onUpdate,
  isUpdating,
}: EditRecurringRuleModalProps) {
  const [values, setValues] = React.useState<RecurringRuleFormValues>(() =>
    rule
      ? toFormValues(rule)
      : {
          amount: "",
          description: "",
          category: "",
          frequencyUnit: "monthly",
          intervalCount: "1",
          startDate: "",
        }
  );

  const handleChange = (field: keyof RecurringRuleFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rule) return;
    const numAmount = parseFloat(values.amount);
    if (isNaN(numAmount) || !values.description.trim() || !values.category.trim()) return;
    await onUpdate(rule.id, {
      amount: numAmount,
      description: values.description.trim(),
      category: values.category.trim(),
      frequencyUnit: values.frequencyUnit,
      intervalCount: parseInt(values.intervalCount, 10) || 1,
      startDate: values.startDate,
    });
    onClose();
  };

  return (
    <Modal isOpen={!!rule} onClose={onClose} title="Edit Recurring Rule">
      <form onSubmit={handleSubmit} className="space-y-4">
        <RecurringRuleFormFields values={values} onChange={handleChange} />
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isUpdating}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}