import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { DateTime } from "luxon";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
