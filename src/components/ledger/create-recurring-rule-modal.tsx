"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

export function CreateRecurringRuleModal({
  isOpen,
  onClose,
  onCreate,
  isCreating,
}: CreateRecurringRuleModalProps) {
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [frequencyUnit, setFrequencyUnit] = React.useState("monthly");
  const [intervalCount, setIntervalCount] = React.useState("1");
  const [startDate, setStartDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || !description.trim() || !category.trim()) return;
    await onCreate({
      amount: numAmount,
      description: description.trim(),
      category: category.trim(),
      frequencyUnit,
      intervalCount: parseInt(intervalCount, 10) || 1,
      startDate,
    });
    setAmount("");
    setDescription("");
    setCategory("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Recurring Rule">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Amount</label>
            <Input
              type="number"
              step="0.01"
              placeholder="-1200"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Category</label>
            <Input
              placeholder="Rent"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Description</label>
          <Input
            placeholder="Monthly rent payment"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Frequency</label>
            <select
              value={frequencyUnit}
              onChange={(e) => setFrequencyUnit(e.target.value)}
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
              value={intervalCount}
              onChange={(e) => setIntervalCount(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Start Date</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
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
