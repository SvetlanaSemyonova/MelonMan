import { compareKeys, dateKeyLocal, parseYMD } from "./calendarUtils";
import type { AbsenceCategory, AbsenceRow, RegionalHolidayDbRow, StaffProfile } from "./portalTypes";
import type { ScheduleBlockType, SchedulePersonRow, ScheduleSegment } from "../data/scheduleAbsencesMock";
import type { TodayAbsence } from "../data/mock";
import type { AbsenceHistoryRow } from "../data/profileMock";

function todayKey(): string {
  return dateKeyLocal(new Date());
}

export function dateInRangeInclusive(dayKey: string, start: string, end: string): boolean {
  return compareKeys(dayKey, start) >= 0 && compareKeys(dayKey, end) <= 0;
}

function initials(s: StaffProfile): string {
  const a = s.first_name[0] ?? "";
  const b = s.last_name[0] ?? "";
  return `${a}${b}`.toUpperCase();
}

const categoryToScheduleType: Record<AbsenceRow["category"], ScheduleBlockType> = {
  holiday: "holiday",
  sick: "sick",
  remote: "remote",
  birthday_leave: "bday",
};

export function buildSchedulePeople(staff: StaffProfile[], absences: AbsenceRow[]): SchedulePersonRow[] {
  return staff.map((s) => {
    const segments: ScheduleSegment[] = absences
      .filter((a) => a.staff_id === s.id)
      .map((a) => ({
        start: a.start_date,
        end: a.end_date,
        label: a.label || a.category,
        type: categoryToScheduleType[a.category],
      }));
    return {
      id: s.id,
      name: `${s.first_name} ${s.last_name}`,
      segments,
    };
  });
}

export type MetricKey = "onHoliday" | "sickLeave" | "oooRemote";

export function computeMetrics(
  _staff: StaffProfile[],
  absences: AbsenceRow[],
  dayKey: string = todayKey()
): { onHoliday: number; sickLeave: number; oooRemote: number } {
  const active = absences.filter((a) => dateInRangeInclusive(dayKey, a.start_date, a.end_date));
  const byCat = { holiday: new Set<string>(), sick: new Set<string>(), remote: new Set<string>() };
  for (const a of active) {
    if (a.category === "holiday" || a.category === "birthday_leave") {
      byCat.holiday.add(a.staff_id);
    } else if (a.category === "sick") {
      byCat.sick.add(a.staff_id);
    } else if (a.category === "remote") {
      byCat.remote.add(a.staff_id);
    }
  }
  return {
    onHoliday: byCat.holiday.size,
    sickLeave: byCat.sick.size,
    oooRemote: byCat.remote.size,
  };
}

export function staffForMetricModal(
  staff: StaffProfile[],
  absences: AbsenceRow[],
  key: MetricKey,
  dayKey: string = todayKey()
): { name: string; initials: string; untilLabel: string }[] {
  const active = absences.filter((a) => dateInRangeInclusive(dayKey, a.start_date, a.end_date));
  const filtered =
    key === "onHoliday"
      ? active.filter((a) => a.category === "holiday" || a.category === "birthday_leave")
      : key === "sickLeave"
        ? active.filter((a) => a.category === "sick")
        : active.filter((a) => a.category === "remote");
  const byStaff = new Map<string, AbsenceRow>();
  for (const a of filtered) {
    if (!byStaff.has(a.staff_id)) byStaff.set(a.staff_id, a);
  }
  const staffMap = new Map(staff.map((s) => [s.id, s]));
  return [...byStaff.values()].map((a) => {
    const s = staffMap.get(a.staff_id);
    return {
      name: s ? `${s.first_name} ${s.last_name}` : "Unknown",
      initials: s ? initials(s) : "?",
      untilLabel: a.detail || `Until ${a.end_date}`,
    };
  });
}

export function buildTodaysAbsences(
  staff: StaffProfile[],
  absences: AbsenceRow[],
  dayKey: string = todayKey()
): TodayAbsence[] {
  const active = absences.filter((a) => dateInRangeInclusive(dayKey, a.start_date, a.end_date));
  const byStaff = new Map<string, AbsenceRow>();
  for (const a of active) {
    if (!byStaff.has(a.staff_id)) byStaff.set(a.staff_id, a);
  }
  const staffMap = new Map(staff.map((s) => [s.id, s]));
  return [...byStaff.values()].map((a) => {
    const s = staffMap.get(a.staff_id);
    const status =
      a.category === "sick"
        ? "Sick Leave"
        : a.category === "remote"
          ? "Working Remote"
          : "Holiday";
    return {
      id: a.id,
      name: s ? `${s.first_name} ${s.last_name}` : "Unknown",
      role: s?.title ?? "",
      initials: s ? initials(s) : "?",
      status,
      detail: a.detail || `${a.start_date} – ${a.end_date}`,
    };
  });
}

export function pickViewerStaff(staff: StaffProfile[]): StaffProfile | null {
  if (!staff.length) return null;
  const admin = staff.find((s) => s.role === "admin");
  return admin ?? staff[0];
}

export function absenceTypeVariant(cat: AbsenceRow["category"]): AbsenceHistoryRow["typeVariant"] {
  if (cat === "sick") return "medical";
  if (cat === "birthday_leave") return "birthday";
  return "vacation";
}

// Yearly sick-leave allowance. Change here to tune the default, or later move
// to per-staff fields (sick_total/sick_used) on staff_profiles.
export const SICK_DAYS_PER_YEAR = 10;

export function computeSickBalance(
  staffId: string,
  absences: AbsenceRow[],
  totalPerYear: number = SICK_DAYS_PER_YEAR,
  year: number = new Date().getFullYear()
): { used: number; total: number; left: number } {
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;
  let used = 0;
  for (const a of absences) {
    if (a.staff_id !== staffId) continue;
    if (a.category !== "sick") continue;
    const start = compareKeys(a.start_date, yearStart) < 0 ? yearStart : a.start_date;
    const end = compareKeys(a.end_date, yearEnd) > 0 ? yearEnd : a.end_date;
    if (compareKeys(start, end) > 0) continue;
    const d1 = parseYMD(start);
    const d2 = parseYMD(end);
    const days = Math.round((d2.getTime() - d1.getTime()) / 86400000) + 1;
    used += Math.max(0, days);
  }
  return {
    used,
    total: totalPerYear,
    left: Math.max(0, totalPerYear - used),
  };
}

export function buildAbsenceHistoryForStaff(staffId: string, absences: AbsenceRow[]): AbsenceHistoryRow[] {
  return absences
    .filter((a) => a.staff_id === staffId)
    .sort((a, b) => compareKeys(b.start_date, a.start_date))
    .map((a) => ({
      id: a.id,
      type: a.label || a.category,
      typeVariant: absenceTypeVariant(a.category),
      duration: `${a.start_date} – ${a.end_date}`,
      status: a.status === "Pending" ? "PENDING" : "APPROVED",
    }));
}

export function formatJoined(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso + "T12:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", { month: "long", day: "numeric", year: "numeric" }).format(d);
}

export function regionalRowsToProfileFormat(rows: RegionalHolidayDbRow[]) {
  return [...rows]
    .sort((a, b) => compareKeys(a.event_date, b.event_date))
    .map((r) => {
      const d = parseYMD(r.event_date);
      const dayLabel = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d);
      return {
        id: r.id,
        dayLabel,
        title: r.title,
        meta: r.meta,
        variant: r.variant as "upcoming" | "past",
      };
    });
}

export interface TeamBirthdayItem {
  id: string;
  month: number;
  day: number;
  name: string;
  initials: string;
  ageTurning?: number;
}

export function staffToTeamBirthdays(staff: StaffProfile[]): TeamBirthdayItem[] {
  return staff
    .filter((s) => s.birthday)
    .map((s) => {
      const d = new Date(s.birthday! + "T12:00:00");
      return {
        id: s.id,
        month: d.getMonth(),
        day: d.getDate(),
        name: `${s.first_name} ${s.last_name}`,
        initials: initials(s),
      };
    });
}

export function birthdaysOnDayFromStaff(
  staff: StaffProfile[],
  monthIndex: number,
  day: number
): TeamBirthdayItem[] {
  return staffToTeamBirthdays(staff).filter((b) => b.month === monthIndex && b.day === day);
}

function nextBirthdayFromAnchor(anchor: Date, monthIndex: number, day: number): Date {
  const y = anchor.getFullYear();
  let t = new Date(y, monthIndex, day);
  const a0 = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
  if (t < a0) t = new Date(y + 1, monthIndex, day);
  return t;
}

export function getUpcomingBirthdayWidgetItems(
  staff: StaffProfile[],
  limit = 3
): { id: string; name: string; date: string; detail: string; initials: string }[] {
  const today = new Date();
  const anchor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const items = staffToTeamBirthdays(staff).map((b) => {
    const next = nextBirthdayFromAnchor(anchor, b.month, b.day);
    return {
      ...b,
      next,
      dateStr: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(next),
    };
  });
  items.sort((a, b) => a.next.getTime() - b.next.getTime());
  return items.slice(0, limit).map((b) => ({
    id: b.id,
    name: b.name,
    date: b.dateStr,
    detail: "Birthday",
    initials: b.initials,
  }));
}

export function computePresenceInsights(staff: StaffProfile[], absences: AbsenceRow[]): {
  efficiencyPct: number;
  avgAbsenceDays: string;
  monthlyHeights: number[];
} {
  const dayKey = todayKey();
  const total = Math.max(staff.length, 1);
  const activeToday = new Set(
    absences.filter((a) => dateInRangeInclusive(dayKey, a.start_date, a.end_date)).map((a) => a.staff_id)
  );
  const efficiencyPct = Math.max(0, Math.min(100, Math.round(100 * (1 - activeToday.size / total))));

  let sum = 0;
  let n = 0;
  for (const a of absences) {
    const s0 = parseYMD(a.start_date);
    const s1 = parseYMD(a.end_date);
    const days = Math.max(1, Math.round((s1.getTime() - s0.getTime()) / 86400000) + 1);
    sum += days;
    n += 1;
  }
  const avg = n ? sum / n : 0;
  const avgAbsenceDays = `${avg >= 10 ? avg.toFixed(0) : avg.toFixed(1)}d`;

  const now = new Date();
  const monthlyHeights: number[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const count = absences.filter((a) => {
      const sd = parseYMD(a.start_date);
      return sd.getFullYear() === y && sd.getMonth() === m;
    }).length;
    const h = 24 + Math.min(76, count * 9);
    monthlyHeights.push(h);
  }

  return { efficiencyPct, avgAbsenceDays, monthlyHeights };
}

export function mapQuickRequestTypeToCategory(type: string): AbsenceCategory {
  const t = type.toLowerCase();
  if (t.includes("sick")) return "sick";
  if (t.includes("remote") || t.includes("ooo")) return "remote";
  if (t.includes("birthday") || t.includes("b-day")) return "birthday_leave";
  if (t.includes("vacation") || t.includes("personal")) return "holiday";
  return "holiday";
}
