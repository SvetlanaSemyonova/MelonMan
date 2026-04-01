export const profileUser = {
  firstName: "Aleksandar",
  lastName: "Nikolić",
  title: "Senior Software Architect",
  region: "Serbia, Belgrade",
  employeeId: "#PR-8829",
  manager: "Elena Rossi",
  joined: "March 12, 2021",
  initials: "AN",
};

export const vacationBalance = {
  used: 15,
  total: 20,
  left: 5,
};

export interface AbsenceHistoryRow {
  id: string;
  type: string;
  typeVariant: "vacation" | "medical" | "birthday";
  duration: string;
  status: "APPROVED" | "PENDING";
}

export const absenceHistory: AbsenceHistoryRow[] = [
  {
    id: "1",
    type: "Summer Vacation",
    typeVariant: "vacation",
    duration: "Aug 12 – Aug 22 (10 Working Days)",
    status: "APPROVED",
  },
  {
    id: "2",
    type: "Medical Leave",
    typeVariant: "medical",
    duration: "Jun 04 – Jun 05 (2 Working Days)",
    status: "APPROVED",
  },
  {
    id: "3",
    type: "Birthday Leave",
    typeVariant: "birthday",
    duration: "May 15 (1 Working Day)",
    status: "APPROVED",
  },
];

export interface RegionalHolidayRow {
  id: string;
  dayLabel: string;
  title: string;
  meta: string;
  variant: "upcoming" | "past";
}

export const regionalHolidays: RegionalHolidayRow[] = [
  {
    id: "1",
    dayLabel: "Nov 11",
    title: "Armistice Day",
    meta: "Public Holiday • Monday",
    variant: "upcoming",
  },
  {
    id: "2",
    dayLabel: "Jan 01",
    title: "New Year's Day",
    meta: "Public Holiday • Past",
    variant: "past",
  },
  {
    id: "3",
    dayLabel: "Jan 07",
    title: "Orthodox Christmas",
    meta: "Public Holiday • Past",
    variant: "past",
  },
];

export const leaveTypesProfile = ["Vacation Leave", "Sick Leave", "Birthday Leave", "Personal"];
