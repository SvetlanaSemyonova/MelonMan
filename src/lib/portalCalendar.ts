import type { EventKind, StoredEvent } from "../data/calendarMock";
import type { AbsenceRow, CalendarEventRow, NationalHolidayRow, StaffProfile } from "./portalTypes";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function ymd(y: number, monthIndex: number, day: number): string {
  return `${y}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

function staffShortName(s: StaffProfile): string {
  const last = s.last_name.trim();
  const initial = last.length ? `${last[0]}.` : "";
  return `${s.first_name} ${initial}`.trim();
}

const YEAR_MIN = 2018;
const YEAR_MAX = 2032;

// Anonymous Gregorian algorithm — returns Catholic (Western) Easter Sunday.
function catholicEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const L = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * L) / 451);
  const monthIdx = Math.floor((h + L - 7 * m + 114) / 31) - 1; // 2 = Mar, 3 = Apr
  const day = ((h + L - 7 * m + 114) % 31) + 1;
  return new Date(year, monthIdx, day);
}

// Meeus Julian algorithm for Orthodox Easter (converted to Gregorian by +13 days for 1900–2099).
function orthodoxEaster(year: number): Date {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const julianMonthIdx = Math.floor((d + e + 114) / 31) - 1;
  const julianDay = ((d + e + 114) % 31) + 1;
  const julianTs = new Date(year, julianMonthIdx, julianDay).getTime();
  return new Date(julianTs + 13 * 86400000);
}

function addDaysDate(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function ymdFromDate(d: Date): string {
  return ymd(d.getFullYear(), d.getMonth(), d.getDate());
}

type FloatingSpec = {
  idSuffix: string;
  country: string;
  label: string;
  base: "catholic" | "orthodox";
  offset: number;
};

// Floating (Easter-linked) holidays per country. Russia has no state-sanctioned
// floating public holidays and is intentionally omitted.
const FLOATING_HOLIDAYS: FloatingSpec[] = [
  // Poland (Catholic)
  { idSuffix: "pl-easter-monday",    country: "Польша",   label: "Пасхальный понедельник",            base: "catholic", offset: 1 },
  { idSuffix: "pl-pentecost",        country: "Польша",   label: "Пятидесятница (Зелёные свёнтки)",   base: "catholic", offset: 49 },
  { idSuffix: "pl-corpus-christi",   country: "Польша",   label: "Праздник Тела Христова",            base: "catholic", offset: 60 },

  // Belarus — Radonitsa is an official day off (Tue after Orthodox Thomas Sunday, = OE+9).
  { idSuffix: "by-radonitsa",        country: "Беларусь", label: "Радуница",                          base: "orthodox", offset: 9 },

  // Serbia (Orthodox)
  { idSuffix: "rs-good-friday",      country: "Сербия",   label: "Великая пятница",                   base: "orthodox", offset: -2 },
  { idSuffix: "rs-easter-monday",    country: "Сербия",   label: "Второй день Пасхи",                 base: "orthodox", offset: 1 },

  // Bulgaria (Orthodox)
  { idSuffix: "bg-good-friday",      country: "Болгария", label: "Великая пятница",                   base: "orthodox", offset: -2 },
  { idSuffix: "bg-easter-saturday",  country: "Болгария", label: "Великая суббота",                   base: "orthodox", offset: -1 },
  { idSuffix: "bg-easter-sunday",    country: "Болгария", label: "Пасха",                             base: "orthodox", offset: 0 },
  { idSuffix: "bg-easter-monday",    country: "Болгария", label: "Второй день Пасхи",                 base: "orthodox", offset: 1 },

  // Cyprus (Orthodox + Green Monday)
  { idSuffix: "cy-green-monday",     country: "Кипр",     label: "Чистый понедельник",                base: "orthodox", offset: -48 },
  { idSuffix: "cy-good-friday",      country: "Кипр",     label: "Великая пятница",                   base: "orthodox", offset: -2 },
  { idSuffix: "cy-easter-saturday",  country: "Кипр",     label: "Великая суббота",                   base: "orthodox", offset: -1 },
  { idSuffix: "cy-easter-sunday",    country: "Кипр",     label: "Пасха",                             base: "orthodox", offset: 0 },
  { idSuffix: "cy-easter-monday",    country: "Кипр",     label: "Пасхальный понедельник",            base: "orthodox", offset: 1 },
];

function expandFloatingHolidays(): StoredEvent[] {
  const out: StoredEvent[] = [];
  for (let y = YEAR_MIN; y <= YEAR_MAX; y++) {
    const ce = catholicEaster(y);
    const oe = orthodoxEaster(y);
    for (const spec of FLOATING_HOLIDAYS) {
      const base = spec.base === "catholic" ? ce : oe;
      const d = addDaysDate(base, spec.offset);
      out.push({
        id: `fl-${spec.idSuffix}-${y}`,
        kind: "national",
        label: spec.label,
        start: ymdFromDate(d),
        nationalStyle: "text",
        country: spec.country,
      });
    }
  }
  return out;
}

function expandNationalAnnual(rows: NationalHolidayRow[]): StoredEvent[] {
  const out: StoredEvent[] = [];
  for (const h of rows) {
    for (let y = YEAR_MIN; y <= YEAR_MAX; y++) {
      out.push({
        id: `nat-${h.id}-${y}`,
        kind: "national",
        label: h.name,
        start: ymd(y, h.month, h.day),
        nationalStyle: "text",
        country: h.country,
      });
    }
  }
  return out;
}

function absenceToStoredEvents(staffById: Map<string, StaffProfile>, absences: AbsenceRow[]): StoredEvent[] {
  const out: StoredEvent[] = [];
  for (const a of absences) {
    const staff = staffById.get(a.staff_id);
    if (a.category === "remote") continue;

    let kind: EventKind;
    let label: string;
    if (a.category === "holiday") {
      kind = "holiday";
      label = a.label || "Leave";
    } else if (a.category === "sick") {
      kind = "sick";
      label = staff ? staffShortName(staff) : "Sick";
    } else if (a.category === "birthday_leave") {
      kind = "birthday";
      label = a.label || (staff ? `${staff.first_name}'s Bday` : "Birthday");
    } else {
      continue;
    }

    const end = a.end_date <= a.start_date ? undefined : a.end_date;
    out.push({
      id: `abs-${a.id}`,
      kind,
      label,
      start: a.start_date,
      end: end && end !== a.start_date ? end : undefined,
    });
  }
  return out;
}

function birthdaysToStoredEvents(staff: StaffProfile[]): StoredEvent[] {
  const out: StoredEvent[] = [];
  for (const s of staff) {
    if (!s.birthday) continue;
    const d = new Date(s.birthday + "T12:00:00");
    if (Number.isNaN(d.getTime())) continue;
    const m = d.getMonth();
    const day = d.getDate();
    for (let y = YEAR_MIN; y <= YEAR_MAX; y++) {
      out.push({
        id: `bday-${s.id}-${y}`,
        kind: "birthday",
        label: `${s.first_name}'s Bday`,
        start: ymd(y, m, day),
      });
    }
  }
  return out;
}

function calendarRowsToStoredEvents(rows: CalendarEventRow[]): StoredEvent[] {
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    label: r.label,
    start: r.start_date,
    end: r.end_date && r.end_date !== r.start_date ? r.end_date : undefined,
    nationalStyle: r.national_style ?? undefined,
  }));
}

export function buildMergedStoredEvents(
  staff: StaffProfile[],
  absences: AbsenceRow[],
  national: NationalHolidayRow[],
  calendarRows: CalendarEventRow[]
): StoredEvent[] {
  const staffById = new Map(staff.map((s) => [s.id, s]));
  return [
    ...calendarRowsToStoredEvents(calendarRows),
    ...expandNationalAnnual(national),
    ...expandFloatingHolidays(),
    ...absenceToStoredEvents(staffById, absences),
    ...birthdaysToStoredEvents(staff),
  ];
}
