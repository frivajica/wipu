import { DateTime } from "luxon";
import { LedgerItem, PeriodType } from "./types";

export function groupByMonth(items: LedgerItem[]): Map<string, LedgerItem[]> {
  const groups = new Map<string, LedgerItem[]>();

  items.forEach((item) => {
    const dt = DateTime.fromISO(item.date);
    const key = dt.toFormat("MMMM yyyy");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  });

  return groups;
}

export function groupByWeek(items: LedgerItem[]): Map<string, LedgerItem[]> {
  const groups = new Map<string, LedgerItem[]>();

  items.forEach((item) => {
    const dt = DateTime.fromISO(item.date);
    const weekStart = dt.startOf("week");
    const weekEnd = dt.endOf("week");
    const weekNumber = dt.weekNumber;
    const key = `${dt.toFormat("MMMM yyyy")} - Week ${weekNumber} (${weekStart.toFormat("dd")} to ${weekEnd.toFormat("dd")})`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  });

  return groups;
}

export function groupByBiWeek(items: LedgerItem[]): Map<string, LedgerItem[]> {
  const groups = new Map<string, LedgerItem[]>();

  items.forEach((item) => {
    const dt = DateTime.fromISO(item.date);
    const weekNumber = dt.weekNumber;
    const biWeekNumber = Math.ceil(weekNumber / 2);
    const biWeekStart = dt.startOf("week").minus({ weeks: (weekNumber - 1) % 2 });
    const biWeekEnd = biWeekStart.plus({ weeks: 1 }).endOf("week");
    const key = `${dt.toFormat("MMMM yyyy")} - Bi-Week ${biWeekNumber} (${biWeekStart.toFormat("dd")} to ${biWeekEnd.toFormat("dd")})`;
    if (!groups.has(key)) groups.set(key, []);
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
    const dateDiff =
      DateTime.fromISO(a.date).toMillis() - DateTime.fromISO(b.date).toMillis();
    if (dateDiff !== 0) return dateDiff;
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
