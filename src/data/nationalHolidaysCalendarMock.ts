/** Государственные праздники по календарным датам (ежегодно, month 0–11). */

export interface NationalHolidayEntry {
  id: string;
  month: number;
  day: number;
  name: string;
  /** Страна / регион */
  country: string;
}

export const nationalHolidaysAnnual: NationalHolidayEntry[] = [
  { id: "us-1", month: 10, day: 1, name: "Labor Day", country: "United States" },
  { id: "us-2", month: 10, day: 11, name: "Veterans Day", country: "United States" },
  { id: "us-3", month: 10, day: 28, name: "Thanksgiving", country: "United States" },
  { id: "uk-1", month: 4, day: 1, name: "Early May bank holiday", country: "United Kingdom" },
  { id: "uk-2", month: 11, day: 26, name: "Boxing Day", country: "United Kingdom" },
  { id: "de-1", month: 9, day: 3, name: "German Unity Day", country: "Germany" },
  { id: "de-2", month: 11, day: 25, name: "Christmas Day", country: "Germany" },
  { id: "rs-1", month: 0, day: 1, name: "New Year's Day", country: "Serbia" },
  { id: "rs-2", month: 4, day: 1, name: "Labour Day", country: "Serbia" },
  { id: "fr-1", month: 6, day: 14, name: "Bastille Day", country: "France" },
  { id: "jp-1", month: 4, day: 29, name: "Showa Day", country: "Japan" },
  { id: "ca-1", month: 6, day: 1, name: "Canada Day", country: "Canada" },
];

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Следующее наступление даты (год может увеличиться). */
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

/** Для виджета: ближайшие праздники по дате наступления */
export function getUpcomingNationalHolidays(limit = 3): {
  id: string;
  name: string;
  date: string;
  country: string;
  countdown: string;
}[] {
  const withMeta = nationalHolidaysAnnual.map((h) => {
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

export function nationalHolidaysOnDay(monthIndex: number, day: number): NationalHolidayEntry[] {
  return nationalHolidaysAnnual.filter((h) => h.month === monthIndex && h.day === day);
}
