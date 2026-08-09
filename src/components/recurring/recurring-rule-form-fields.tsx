"use client";

import { Input } from "@/components/ui/input";

export interface RecurringRuleFormValues {
  amount: string;
  description: string;
  category: string;
  frequencyUnit: string;
  intervalCount: string;
  startDate: string;
}

interface RecurringRuleFormFieldsProps {
  values: RecurringRuleFormValues;
  onChange: (field: keyof RecurringRuleFormValues, value: string) => void;
}

export function RecurringRuleFormFields({
  values,
  onChange,
}: RecurringRuleFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Amount</label>
          <Input
            type="number"
            step="0.01"
            placeholder="-1200"
            value={values.amount}
            onChange={(e) => onChange("amount", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Category</label>
          <Input
            placeholder="Rent"
            value={values.category}
            onChange={(e) => onChange("category", e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">Description</label>
        <Input
          placeholder="Monthly rent payment"
          value={values.description}
          onChange={(e) => onChange("description", e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Frequency</label>
          <select
            value={values.frequencyUnit}
            onChange={(e) => onChange("frequencyUnit", e.target.value)}
            className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-text"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Every</label>
          <Input
            type="number"
            min={1}
            value={values.intervalCount}
            onChange={(e) => onChange("intervalCount", e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">Start Date</label>
        <Input
          type="date"
          value={values.startDate}
          onChange={(e) => onChange("startDate", e.target.value)}
          required
        />
      </div>
    </div>
  );
}