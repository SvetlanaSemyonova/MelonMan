/** Отрезки отсутствий по календарным датам (YYYY-MM-DD, конец включительно). */

export type ScheduleBlockType = "holiday" | "sick" | "remote" | "bday";

export interface ScheduleSegment {
  start: string;
  end: string;
  label: string;
  type: ScheduleBlockType;
}

export interface SchedulePersonRow {
  id: string;
  name: string;
  segments: ScheduleSegment[];
}

export const schedulePeople: SchedulePersonRow[] = [
  {
    id: "1",
    name: "Sarah Jenkins",
    segments: [
      { start: "2024-10-22", end: "2024-10-26", label: "Holiday (5 days)", type: "holiday" },
      { start: "2024-11-04", end: "2024-11-08", label: "Holiday", type: "holiday" },
      { start: "2025-01-13", end: "2025-01-17", label: "Vacation", type: "holiday" },
      { start: "2026-04-02", end: "2026-04-06", label: "Holiday (5 days)", type: "holiday" },
    ],
  },
  {
    id: "2",
    name: "Marcus Thorne",
    segments: [
      { start: "2024-10-21", end: "2024-10-22", label: "Sick", type: "sick" },
      { start: "2024-11-11", end: "2024-11-12", label: "Sick", type: "sick" },
      { start: "2024-12-02", end: "2024-12-03", label: "Sick", type: "sick" },
      { start: "2026-03-30", end: "2026-03-31", label: "Sick", type: "sick" },
    ],
  },
  {
    id: "3",
    name: "Elena Vasquez",
    segments: [
      { start: "2024-10-23", end: "2024-10-25", label: "Remote (3 days)", type: "remote" },
      { start: "2024-11-18", end: "2024-11-20", label: "Remote", type: "remote" },
      { start: "2026-04-01", end: "2026-04-03", label: "Remote (3 days)", type: "remote" },
    ],
  },
  {
    id: "4",
    name: "James Okonkwo",
    segments: [
      { start: "2024-10-25", end: "2024-10-27", label: "B-Day Leave", type: "bday" },
      { start: "2024-11-25", end: "2024-11-26", label: "B-Day Leave", type: "bday" },
      { start: "2026-04-04", end: "2026-04-06", label: "B-Day Leave", type: "bday" },
    ],
  },
  {
    id: "5",
    name: "Alex Mercer",
    segments: [
      { start: "2024-11-01", end: "2024-11-05", label: "Holiday", type: "holiday" },
      { start: "2026-04-10", end: "2026-04-14", label: "Holiday", type: "holiday" },
    ],
  },
];
