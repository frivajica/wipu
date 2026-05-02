"use client";

import * as React from "react";

export interface LedgerFormValues {
  amount: string;
  description: string;
  category: string;
  date: string;
}

export function useLedgerForm(defaultDate: string) {
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [date, setDate] = React.useState(defaultDate);

  const reset = () => {
    setAmount("");
    setDescription("");
    setCategory("");
    setDate(defaultDate);
  };

  const isValid =
    !isNaN(parseFloat(amount)) && description.trim().length > 0;

  const toPayload = () => ({
    amount: parseFloat(amount),
    description: description.trim(),
    category: category.trim() || "Uncategorized",
    date,
  });

  return {
    values: { amount, description, category, date },
    setters: { setAmount, setDescription, setCategory, setDate },
    reset,
    isValid,
    toPayload,
  };
}
