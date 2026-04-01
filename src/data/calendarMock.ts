import {
  addDays,
  compareKeys,
  dateKeyLocal,
  datesEqualDay,
  maxDate,
  minDate,
  parseYMD,
  startOfWeekMonday,
} from "../lib/calendarUtils";

export const calendarSubtitle = "Team availability and scheduled absence overview.";

export type EventKind = "national" | "sick" | "holiday" | "birthday" | "event";

export interface StoredEvent {
  id: string;
  kind: EventKind;
  label: string;
  start: string;
  /** Inclusive end; omit for single-day */
  end?: string;
  /** National holiday: full purple bar vs text line */
  nationalStyle?: "bar" | "text";
}

/** Демо-массив (календарь в приложении берёт события из Supabase через PortalDataProvider). */
export const storedEvents: StoredEvent[] = [
  { id: "s1", kind: "sick", label: "Sarah J.", start: "2024-05-02" },
  {
    id: "n1",
    kind: "national",
    label: "Bank Holiday",
    start: "2024-05-06",
    nationalStyle: "bar",
  },
  {
    id: "n2",
    kind: "national",
    label: "May Holidays (3)",
    start: "2024-05-07",
    nationalStyle: "text",
  },
  { id: "h1", kind: "holiday", label: "", start: "2024-05-08", end: "2024-05-10" },
  { id: "b1", kind: "birthday", label: "Marco's Bday", start: "2024-05-15" },
  { id: "e1", kind: "event", label: "London Conf.", start: "2024-05-16" },
  { id: "s2", kind: "sick", label: "Alex P.", start: "2024-05-22" },
  { id: "h4", kind: "holiday", label: "Alex Leave", start: "2024-05-24" },
  { id: "demo1", kind: "birthday", label: "Team Day", start: "2024-06-01" },
  { id: "demo2", kind: "national", label: "Regional day", start: "2024-08-15", nationalStyle: "text" },
  { id: "demo3", kind: "holiday", label: "Winter break", start: "2024-12-23", end: "2024-12-27" },
];

export interface RenderEvent {
  id: string;
  kind: EventKind;
  label: string;
  spanRole?: "start" | "middle" | "end" | "single";
  nationalStyle?: "bar" | "text";
}

function globalRange(ev: StoredEvent): { start: Date; end: Date } {
  const start = parseYMD(ev.start);
  const end = ev.end ? parseYMD(ev.end) : start;
  return { start, end };
}

/** События для одной ячейки календаря */
export function getRenderEventsForDay(cellDate: Date, storedEvents: StoredEvent[]): RenderEvent[] {
  const out: RenderEvent[] = [];
  const k = dateKeyLocal(cellDate);

  for (const ev of storedEvents) {
    const { start: startD, end: endD } = globalRange(ev);
    if (compareKeys(k, ev.start) < 0 || compareKeys(k, ev.end ?? ev.start) > 0) continue;

    if (ev.kind === "holiday" && (ev.end ?? ev.start) !== ev.start) {
      const weekMon = startOfWeekMonday(cellDate);
      const weekSun = addDays(weekMon, 6);
      const rowStart = maxDate(startD, weekMon);
      const rowEnd = minDate(endD, weekSun);
      if (cellDate < rowStart || cellDate > rowEnd) continue;

      let spanRole: RenderEvent["spanRole"];
      if (datesEqualDay(rowStart, rowEnd)) spanRole = "single";
      else if (datesEqualDay(cellDate, rowStart)) spanRole = "start";
      else if (datesEqualDay(cellDate, rowEnd)) spanRole = "end";
      else spanRole = "middle";

      out.push({
        id: `${ev.id}-${k}`,
        kind: ev.kind,
        label: ev.label,
        spanRole,
      });
      continue;
    }

    out.push({
      id: `${ev.id}-${k}`,
      kind: ev.kind,
      label: ev.label,
      nationalStyle: ev.nationalStyle,
    });
  }

  return out;
}

export const legendItems: { key: string; label: string; kind: EventKind | "birthdayLegend" }[] = [
  { key: "holiday", label: "Holiday (Amber)", kind: "holiday" },
  { key: "sick", label: "Sick (Red)", kind: "sick" },
  { key: "national", label: "National Holiday (Purple)", kind: "national" },
  { key: "birthday", label: "Birthday", kind: "birthdayLegend" },
];
