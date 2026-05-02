import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { DateTime } from "luxon";
import { LedgerItem, PeriodType } from "./types";

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

// Date grouping utilities
export function groupByMonth(items: LedgerItem[]): Map<string, LedgerItem[]> {
  const groups = new Map<string, LedgerItem[]>();
  
  // Sort items by date first
  const sortedItems = [...items].sort((a, b) => 
    DateTime.fromISO(a.date).toMillis() - DateTime.fromISO(b.date).toMillis()
  );
  
  sortedItems.forEach((item) => {
    const dt = DateTime.fromISO(item.date);
    const key = dt.toFormat("MMMM yyyy");
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  });
  
  return groups;
}

export function groupByWeek(items: LedgerItem[]): Map<string, LedgerItem[]> {
  const groups = new Map<string, LedgerItem[]>();
  
  const sortedItems = [...items].sort((a, b) => 
    DateTime.fromISO(a.date).toMillis() - DateTime.fromISO(b.date).toMillis()
  );
  
  sortedItems.forEach((item) => {
    const dt = DateTime.fromISO(item.date);
    const weekStart = dt.startOf("week");
    const weekEnd = dt.endOf("week");
    const weekNumber = dt.weekNumber;
    const key = `${dt.toFormat("MMMM yyyy")} - Week ${weekNumber} (${weekStart.toFormat("dd")} to ${weekEnd.toFormat("dd")})`;
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  });
  
  return groups;
}

export function groupByBiWeek(items: LedgerItem[]): Map<string, LedgerItem[]> {
  const groups = new Map<string, LedgerItem[]>();
  
  const sortedItems = [...items].sort((a, b) => 
    DateTime.fromISO(a.date).toMillis() - DateTime.fromISO(b.date).toMillis()
  );
  
  sortedItems.forEach((item) => {
    const dt = DateTime.fromISO(item.date);
    const weekNumber = dt.weekNumber;
    const biWeekNumber = Math.ceil(weekNumber / 2);
    const biWeekStart = dt.startOf("week").minus({ weeks: (weekNumber - 1) % 2 });
    const biWeekEnd = biWeekStart.plus({ weeks: 1 }).endOf("week");
    const key = `${dt.toFormat("MMMM yyyy")} - Bi-Week ${biWeekNumber} (${biWeekStart.toFormat("dd")} to ${biWeekEnd.toFormat("dd")})`;
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  });
  
  return groups;
}

export function groupByCustomRange(
  items: LedgerItem[],
  start: string,
  end: string
): Map<string, LedgerItem[]> {
  const groups = new Map<string, LedgerItem[]>();
  const startDt = DateTime.fromISO(start);
  const endDt = DateTime.fromISO(end);
  
  const key = `Custom Range (${startDt.toFormat("MMM d")} - ${endDt.toFormat("MMM d")})`;
  
  const filteredItems = items.filter((item) => {
    const itemDt = DateTime.fromISO(item.date);
    return itemDt >= startDt && itemDt <= endDt;
  });
  
  groups.set(key, filteredItems);
  return groups;
}

export function getPeriodBalance(items: LedgerItem[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}

export function sortItemsByDate(items: LedgerItem[]): LedgerItem[] {
  return [...items].sort((a, b) => {
    const dateDiff = DateTime.fromISO(a.date).toMillis() - DateTime.fromISO(b.date).toMillis();
    if (dateDiff !== 0) return dateDiff;
    // If same date, maintain original sort order
    return a.sortOrder - b.sortOrder;
  });
}

export function groupItemsByPeriod(
  items: LedgerItem[],
  periodType: PeriodType,
  customRange?: { start: string; end: string }
): Map<string, LedgerItem[]> {
  switch (periodType) {
    case "monthly":
      return groupByMonth(items);
    case "weekly":
      return groupByWeek(items);
    case "bi-weekly":
      return groupByBiWeek(items);
    case "custom":
      if (customRange) {
        return groupByCustomRange(items, customRange.start, customRange.end);
      }
      return new Map();
    default:
      return groupByMonth(items);
  }
}
