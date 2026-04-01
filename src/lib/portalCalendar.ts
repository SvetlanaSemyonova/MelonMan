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
    ...absenceToStoredEvents(staffById, absences),
    ...birthdaysToStoredEvents(staff),
  ];
}
