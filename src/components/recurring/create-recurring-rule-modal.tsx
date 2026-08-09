"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  RecurringRuleFormFields,
  RecurringRuleFormValues,
} from "./recurring-rule-form-fields";

interface CreateRecurringRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: {
    amount: number;
    description: string;
    category: string;
    frequencyUnit: string;
    intervalCount: number;
    startDate: string;
  }) => Promise<unknown>;
  isCreating: boolean;
}

function initialValues(): RecurringRuleFormValues {
  return {
    amount: "",
    description: "",
    category: "",
    frequencyUnit: "monthly",
    intervalCount: "1",
    startDate: new Date().toISOString().split("T")[0],
  };
}

export function CreateRecurringRuleModal({
  isOpen,
  onClose,
  onCreate,
  isCreating,
}: CreateRecurringRuleModalProps) {
  const [values, setValues] = React.useState<RecurringRuleFormValues>(initialValues);

  const handleChange = (field: keyof RecurringRuleFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(values.amount);
    if (isNaN(numAmount) || !values.description.trim() || !values.category.trim()) return;
    await onCreate({
      amount: numAmount,
      description: values.description.trim(),
      category: values.category.trim(),
      frequencyUnit: values.frequencyUnit,
      intervalCount: parseInt(values.intervalCount, 10) || 1,
      startDate: values.startDate,
    });
    setValues(initialValues());
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Recurring Rule">
      <form onSubmit={handleSubmit} className="space-y-4">
        <RecurringRuleFormFields values={values} onChange={handleChange} />
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isCreating}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}