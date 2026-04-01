/** Local-date helpers (avoid UTC shift from toISOString). */

export function dateKeyLocal(d: Date): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseYMD(s: string): Date {
  const [y, mo, da] = s.split("-").map(Number);
  return new Date(y, mo - 1, da);
}

export function compareKeys(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function startOfWeekMonday(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - dow);
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
}

export function addMonthsFirstDay(y: number, m: number, delta: number): Date {
  return new Date(y, m + delta, 1);
}

export function maxDate(a: Date, b: Date): Date {
  return a.getTime() >= b.getTime() ? a : b;
}

export function minDate(a: Date, b: Date): Date {
  return a.getTime() <= b.getTime() ? a : b;
}

export function datesEqualDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Целые дни между a и b (b ≥ a). */
export function calendarDaysBetween(a: Date, b: Date): number {
  const t0 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const t1 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((t1 - t0) / 86400000);
}

export function clipSegmentToWeek(
  segStart: Date,
  segEnd: Date,
  weekMonday: Date
): { startCol: number; span: number } | null {
  const w0 = new Date(weekMonday.getFullYear(), weekMonday.getMonth(), weekMonday.getDate());
  const w6 = addDays(w0, 6);
  const clipS = maxDate(segStart, w0);
  const clipE = minDate(segEnd, w6);
  if (clipS.getTime() > clipE.getTime()) return null;
  const startCol = calendarDaysBetween(w0, clipS);
  const span = calendarDaysBetween(clipS, clipE) + 1;
  return { startCol, span };
}

export function clipSegmentToMonth(
  segStart: Date,
  segEnd: Date,
  year: number,
  monthIndex: number
): { startCol: number; span: number } | null {
  const m0 = new Date(year, monthIndex, 1);
  const mLast = new Date(year, monthIndex + 1, 0);
  const clipS = maxDate(segStart, m0);
  const clipE = minDate(segEnd, mLast);
  if (clipS.getTime() > clipE.getTime()) return null;
  const startCol = clipS.getDate() - 1;
  const span = calendarDaysBetween(clipS, clipE) + 1;
  return { startCol, span };
}

export function buildMonthGrid(year: number, monthIndex: number): { d: Date; inMonth: boolean }[] {
  const first = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const startPad = (first.getDay() + 6) % 7;
  const cells: { d: Date; inMonth: boolean }[] = [];
  for (let i = startPad; i > 0; i--) {
    cells.push({ d: new Date(year, monthIndex, 1 - i), inMonth: false });
  }
  for (let day = 1; day <= lastDay; day++) {
    cells.push({ d: new Date(year, monthIndex, day), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const prev = cells[cells.length - 1].d;
    const next = addDays(prev, 1);
    cells.push({ d: next, inMonth: false });
  }
  while (cells.length < 42) {
    const prev = cells[cells.length - 1].d;
    cells.push({ d: addDays(prev, 1), inMonth: false });
  }
  return cells;
}

export function formatMonthYear(year: number, monthIndex: number, locale = "en-GB"): string {
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
    new Date(year, monthIndex, 1)
  );
}

export function formatWeekRange(weekStartMonday: Date, locale = "en-GB"): string {
  const end = addDays(weekStartMonday, 6);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const yOpts: Intl.DateTimeFormatOptions = { ...opts, year: "numeric" };
  const sameYear = weekStartMonday.getFullYear() === end.getFullYear();
  const startStr = new Intl.DateTimeFormat(locale, sameYear ? opts : yOpts).format(weekStartMonday);
  const endStr = new Intl.DateTimeFormat(locale, yOpts).format(end);
  return `${startStr} – ${endStr}`;
}

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function yearRange(centerYear: number, span = 12): number[] {
  const out: number[] = [];
  for (let y = centerYear - span; y <= centerYear + span; y++) out.push(y);
  return out;
}
