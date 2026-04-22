export type StaffProfile = {
  id: string;
  email: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  title: string;
  role: "employee" | "lead" | "admin";
  permissions: string[];
  region: string;
  employee_id: string;
  manager_name: string;
  joined_at: string | null;
  vacation_used: number;
  vacation_total: number;
  sick_total: number;
  birthday: string | null;
  country_citizenship: string;
  country_residence: string;
  country_legal: string;
  personal_note: string;
  created_at: string;
};

export type AbsenceCategory = "holiday" | "sick" | "remote" | "birthday_leave";


export type AbsenceRow = {
  id: string;
  staff_id: string;
  category: AbsenceCategory;
  label: string;
  start_date: string;
  end_date: string;
  status: string;
  detail: string;
  created_at: string;
};

export type NationalHolidayRow = {
  id: string;
  month: number;
  day: number;
  name: string;
  country: string;
};

export type RegionalHolidayDbRow = {
  id: string;
  event_date: string;
  title: string;
  region: string;
  meta: string;
  variant: "upcoming" | "past";
};

export type CalendarEventRow = {
  id: string;
  kind: "national" | "sick" | "holiday" | "birthday" | "event";
  label: string;
  start_date: string;
  end_date: string | null;
  national_style: "bar" | "text" | null;
  staff_id: string | null;
};
