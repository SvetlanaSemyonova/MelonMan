export const metrics = {
  onHoliday: 12,
  sickLeave: 3,
  oooRemote: 45,
} as const;

export type AbsenceStatus = "Holiday" | "Sick Leave" | "Working Remote";

export interface TodayAbsence {
  id: string;
  name: string;
  role: string;
  initials: string;
  status: AbsenceStatus;
  detail: string;
}

export const todaysAbsences: TodayAbsence[] = [
  {
    id: "1",
    name: "Sarah Jenkins",
    role: "Product Designer",
    initials: "SJ",
    status: "Holiday",
    detail: "5 days remaining",
  },
  {
    id: "2",
    name: "Marcus Thorne",
    role: "Engineering Lead",
    initials: "MT",
    status: "Sick Leave",
    detail: "Returning tomorrow",
  },
  {
    id: "3",
    name: "Elena Vasquez",
    role: "HR Partner",
    initials: "EV",
    status: "Working Remote",
    detail: "Until Friday",
  },
  {
    id: "4",
    name: "James Okonkwo",
    role: "Backend Developer",
    initials: "JO",
    status: "Holiday",
    detail: "3 days remaining",
  },
];

export interface BirthdayItem {
  id: string;
  name: string;
  date: string;
  detail: string;
  initials: string;
}

export const upcomingBirthdays: BirthdayItem[] = [
  { id: "1", name: "Sarah Jenkins", date: "Oct 26", detail: "Turning 32", initials: "SJ" },
  { id: "2", name: "Marcus Thorne", date: "Oct 28", detail: "Turning 41", initials: "MT" },
  { id: "3", name: "Priya Nair", date: "Oct 29", detail: "Turning 29", initials: "PN" },
];

export const absenceTypes = ["Vacation", "Sick Leave", "Remote / OOO", "Personal", "B-Day Leave"];
