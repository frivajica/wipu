import { DateTime } from "luxon";

export function formatCurrency(amount: number): string {
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(absAmount);
  return amount < 0 ? `-${formatted}` : `+${formatted}`;
}

export function formatDate(dateString: string): string {
  return DateTime.fromISO(dateString).toFormat("MMM dd");
}

export function formatDateFull(dateString: string): string {
  return DateTime.fromISO(dateString).toFormat("MMMM d, yyyy");
}

export function getCurrentDate(): string {
  return DateTime.now().toISODate() || "";
}
