import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { StoredEvent } from "../data/calendarMock";
import type { SchedulePersonRow } from "../data/scheduleAbsencesMock";
import type { TodayAbsence } from "../data/mock";
import type { AbsenceHistoryRow } from "../data/profileMock";
import { buildMergedStoredEvents } from "../lib/portalCalendar";
import {
  buildAbsenceHistoryForStaff,
  buildSchedulePeople,
  buildTodaysAbsences,
  computeMetrics,
  computePresenceInsights,
  computeSickBalance,
  getUpcomingBirthdayWidgetItems,
  pickViewerStaff,
  regionalRowsToProfileFormat,
  staffForMetricModal,
  staffToTeamBirthdays,
  type MetricKey,
  type TeamBirthdayItem,
} from "../lib/portalDerive";
import type {
  AbsenceRow,
  CalendarEventRow,
  NationalHolidayRow,
  RegionalHolidayDbRow,
  StaffProfile,
} from "../lib/portalTypes";
import { supabase } from "../lib/supabaseClient";

type PortalDataContextValue = {
  ready: boolean;
  loading: boolean;
  error: string | null;
  staff: StaffProfile[];
  viewer: StaffProfile | null;
  refetch: () => Promise<void>;
  absences: AbsenceRow[];
  storedEvents: StoredEvent[];
  schedulePeople: SchedulePersonRow[];
  metrics: ReturnType<typeof computeMetrics>;
  todaysAbsences: TodayAbsence[];
  metricModalList: (key: MetricKey) => ReturnType<typeof staffForMetricModal>;
  nationalHolidays: NationalHolidayRow[];
  regionalHolidaysProfile: ReturnType<typeof regionalRowsToProfileFormat>;
  absenceHistory: AbsenceHistoryRow[];
  vacationBalance: { used: number; total: number; left: number };
  sickBalance: { used: number; total: number; left: number };
  teamBirthdays: TeamBirthdayItem[];
  upcomingBirthdaysWidget: ReturnType<typeof getUpcomingBirthdayWidgetItems>;
  presenceInsights: ReturnType<typeof computePresenceInsights>;
  nextBirthdayLine: string | null;
};

const PortalDataContext = createContext<PortalDataContextValue | null>(null);

async function fetchAll() {
  if (!supabase) {
    return {
      staff: [] as StaffProfile[],
      absences: [] as AbsenceRow[],
      national: [] as NationalHolidayRow[],
      regional: [] as RegionalHolidayDbRow[],
      calendar: [] as CalendarEventRow[],
      error:
        "Нет переменных VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. В корне проекта создайте файл .env (скопируйте из .env.example), вставьте ключ из Supabase → Settings → API и перезапустите npm run dev.",
    };
  }

  const [st, ab, na, re, ca] = await Promise.all([
    supabase.from("staff_profiles").select("*").order("created_at", { ascending: true }),
    supabase.from("absences").select("*").order("start_date", { ascending: false }),
    supabase.from("national_holidays").select("*"),
    supabase.from("regional_holidays").select("*"),
    supabase.from("calendar_events").select("*"),
  ]);

  const err =
    st.error?.message ||
    ab.error?.message ||
    na.error?.message ||
    re.error?.message ||
    ca.error?.message ||
    null;

  return {
    staff: (st.data ?? []) as StaffProfile[],
    absences: (ab.data ?? []) as AbsenceRow[],
    national: (na.data ?? []) as NationalHolidayRow[],
    regional: (re.data ?? []) as RegionalHolidayDbRow[],
    calendar: (ca.data ?? []) as CalendarEventRow[],
    error: err,
  };
}

export function PortalDataProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [absences, setAbsences] = useState<AbsenceRow[]>([]);
  const [national, setNational] = useState<NationalHolidayRow[]>([]);
  const [regional, setRegional] = useState<RegionalHolidayDbRow[]>([]);
  const [calendar, setCalendar] = useState<CalendarEventRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchAll();
    setStaff(res.staff);
    setAbsences(res.absences);
    setNational(res.national);
    setRegional(res.regional);
    setCalendar(res.calendar);
    setError(res.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const viewer = useMemo(() => pickViewerStaff(staff), [staff]);

  const storedEvents = useMemo(
    () => buildMergedStoredEvents(staff, absences, national, calendar),
    [staff, absences, national, calendar]
  );

  const schedulePeople = useMemo(() => buildSchedulePeople(staff, absences), [staff, absences]);

  const metrics = useMemo(() => computeMetrics(staff, absences), [staff, absences]);

  const todaysAbsences = useMemo(() => buildTodaysAbsences(staff, absences), [staff, absences]);

  const metricModalList = useCallback(
    (key: MetricKey) => staffForMetricModal(staff, absences, key),
    [staff, absences]
  );

  const regionalHolidaysProfile = useMemo(() => regionalRowsToProfileFormat(regional), [regional]);

  const absenceHistory = useMemo(() => {
    if (!viewer) return [];
    return buildAbsenceHistoryForStaff(viewer.id, absences);
  }, [viewer, absences]);

  const vacationBalance = useMemo(() => {
    if (!viewer) return { used: 0, total: 20, left: 20 };
    const left = Math.max(0, viewer.vacation_total - viewer.vacation_used);
    return {
      used: viewer.vacation_used,
      total: viewer.vacation_total,
      left,
    };
  }, [viewer]);

  const sickBalance = useMemo(() => {
    if (!viewer) return { used: 0, total: 10, left: 10 };
    return computeSickBalance(viewer.id, absences, viewer.sick_total);
  }, [viewer, absences]);

  const teamBirthdays = useMemo(() => staffToTeamBirthdays(staff), [staff]);

  const upcomingBirthdaysWidget = useMemo(() => getUpcomingBirthdayWidgetItems(staff, 3), [staff]);

  const presenceInsights = useMemo(() => computePresenceInsights(staff, absences), [staff, absences]);

  const nextBirthdayLine = useMemo(() => {
    const w = getUpcomingBirthdayWidgetItems(staff, 1);
    if (!w.length) return null;
    const b = w[0];
    return `${b.name} — ${b.date}`;
  }, [staff]);

  const value = useMemo<PortalDataContextValue>(
    () => ({
      ready: !loading,
      loading,
      error,
      staff,
      viewer,
      refetch: load,
      absences,
      storedEvents,
      schedulePeople,
      metrics,
      todaysAbsences,
      metricModalList,
      nationalHolidays: national,
      regionalHolidaysProfile,
      absenceHistory,
      vacationBalance,
      sickBalance,
      teamBirthdays,
      upcomingBirthdaysWidget,
      presenceInsights,
      nextBirthdayLine,
    }),
    [
      loading,
      error,
      staff,
      viewer,
      load,
      absences,
      storedEvents,
      schedulePeople,
      metrics,
      todaysAbsences,
      metricModalList,
      national,
      regionalHolidaysProfile,
      absenceHistory,
      vacationBalance,
      sickBalance,
      teamBirthdays,
      upcomingBirthdaysWidget,
      presenceInsights,
      nextBirthdayLine,
    ]
  );

  return <PortalDataContext.Provider value={value}>{children}</PortalDataContext.Provider>;
}

export function usePortalData(): PortalDataContextValue {
  const ctx = useContext(PortalDataContext);
  if (!ctx) {
    throw new Error("usePortalData must be used within PortalDataProvider");
  }
  return ctx;
}
