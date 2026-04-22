import type { NationalHolidayRow } from "./portalTypes";

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function nextOccurrence(monthIndex: number, day: number): Date {
  const today = startOfDay(new Date());
  let y = today.getFullYear();
  let target = startOfDay(new Date(y, monthIndex, day));
  if (target < today) {
    target = startOfDay(new Date(y + 1, monthIndex, day));
  }
  return target;
}

export function daysUntil(monthIndex: number, day: number): number {
  const today = startOfDay(new Date());
  const target = nextOccurrence(monthIndex, day);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function formatCountdown(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

export function formatHolidayDateLabel(monthIndex: number, day: number): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" }).format(
    new Date(2024, monthIndex, day)
  );
}

export function getUpcomingNationalHolidaysFromDb(
  rows: NationalHolidayRow[],
  limit = 3
): { id: string; name: string; date: string; country: string; countdown: string }[] {
  const withMeta = rows.map((h) => {
    const next = nextOccurrence(h.month, h.day);
    const d = daysUntil(h.month, h.day);
    return {
      ...h,
      next,
      days: d,
      date: formatHolidayDateLabel(h.month, h.day),
      countdown: formatCountdown(d),
    };
  });
  withMeta.sort((a, b) => a.next.getTime() - b.next.getTime());
  return withMeta.slice(0, limit).map(({ id, name, date, country, countdown }) => ({
    id,
    name,
    date,
    country,
    countdown,
  }));
}

export function nationalHolidaysOnDayFromDb(
  rows: NationalHolidayRow[],
  monthIndex: number,
  day: number
): NationalHolidayRow[] {
  return rows.filter((h) => h.month === monthIndex && h.day === day);
}
