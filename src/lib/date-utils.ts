import { DateTime } from "luxon";

export function getMidpointDate(dateA: string, dateB: string): string {
  const start = DateTime.fromISO(dateA).toMillis();
  const end = DateTime.fromISO(dateB).toMillis();
  const midpoint = DateTime.fromMillis(start + (end - start) / 2);
  return midpoint.toISODate() || dateA;
}