import { useCallback, useEffect, useMemo, useState } from "react";
import { Plane, Stethoscope, Home, Cake, X } from "lucide-react";
import { usePortalData } from "../context/PortalDataContext";
import {
  addDays,
  buildMonthGrid,
  calendarDaysBetween,
  dateKeyLocal,
  maxDate,
  minDate,
  parseYMD,
} from "../lib/calendarUtils";
import type { AbsenceRow, StaffProfile } from "../lib/portalTypes";

const EMPLOYEE_PALETTE = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#a855f7",
  "#06b6d4",
  "#84cc16",
  "#eab308",
  "#6366f1",
  "#d946ef",
  "#0ea5e9",
  "#10b981",
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function employeeColor(id: string): string {
  return EMPLOYEE_PALETTE[hashStr(id) % EMPLOYEE_PALETTE.length];
}

const RU_MONTHS_FULL = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const RU_MONTHS_SHORT = [
  "янв", "фев", "мар", "апр", "май", "июн",
  "июл", "авг", "сен", "окт", "ноя", "дек",
];

const WEEK_HEADERS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function formatRangeShort(startYmd: string, endYmd: string): string {
  const s = parseYMD(startYmd);
  const e = parseYMD(endYmd);
  const ss = `${s.getDate()} ${RU_MONTHS_SHORT[s.getMonth()]}`;
  const ee = `${e.getDate()} ${RU_MONTHS_SHORT[e.getMonth()]}`;
  if (ss === ee) return ss;
  return `${ss} — ${ee}`;
}

const RU_MONTHS_GEN = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

const RU_WEEKDAY_FULL = [
  "понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье",
];

function formatFullDateRu(ymdKey: string): string {
  const d = parseYMD(ymdKey);
  const dow = RU_WEEKDAY_FULL[(d.getDay() + 6) % 7];
  return `${d.getDate()} ${RU_MONTHS_GEN[d.getMonth()]} ${d.getFullYear()}, ${dow}`;
}

function categoryLabel(cat: string): string {
  if (cat === "sick") return "Sick Leave";
  if (cat === "remote") return "Remote";
  if (cat === "birthday_leave") return "B-day";
  return "Отпуск";
}

function categoryPillBg(cat: string): { bg: string; color: string } {
  if (cat === "sick") return { bg: "var(--sick-bg)", color: "var(--sick)" };
  if (cat === "remote") return { bg: "var(--remote-bg)", color: "var(--remote)" };
  if (cat === "birthday_leave") return { bg: "var(--birthday-bg)", color: "var(--birthday)" };
  return { bg: "var(--holiday-bg)", color: "var(--holiday)" };
}

const OVERLAP_BG =
  "repeating-linear-gradient(-45deg, #f59e0b 0, #f59e0b 3px, #1e293b 3px, #1e293b 6px)";

type Props = {
  year: number;
};

export function YearVacationView({ year }: Props) {
  const { absences, staff } = usePortalData();
  const [openDayKey, setOpenDayKey] = useState<string | null>(null);

  const closeModal = useCallback(() => setOpenDayKey(null), []);

  useEffect(() => {
    if (!openDayKey) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openDayKey, closeModal]);

  useEffect(() => {
    if (!openDayKey) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [openDayKey]);

  const staffMap = useMemo(
    () => new Map<string, StaffProfile>(staff.map((s) => [s.id, s])),
    [staff]
  );

  // All vacation-type absences that overlap the selected year.
  const yearVacations = useMemo(() => {
    const yStart = `${year}-01-01`;
    const yEnd = `${year}-12-31`;
    return absences
      .filter(
        (a) =>
          a.category === "holiday" &&
          a.start_date <= yEnd &&
          a.end_date >= yStart
      )
      .sort((a, b) => a.start_date.localeCompare(b.start_date));
  }, [absences, year]);

  // Day-key → array of absences active that day.
  const absencesByDay = useMemo(() => {
    const map = new Map<string, AbsenceRow[]>();
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);
    for (const a of yearVacations) {
      const s = maxDate(parseYMD(a.start_date), yearStart);
      const e = minDate(parseYMD(a.end_date), yearEnd);
      for (let d = s; d.getTime() <= e.getTime(); d = addDays(d, 1)) {
        const k = dateKeyLocal(d);
        const list = map.get(k) ?? [];
        list.push(a);
        map.set(k, list);
      }
    }
    return map;
  }, [yearVacations, year]);

  // Per-staff total vacation days in this year.
  const staffStats = useMemo(() => {
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);
    const counts = new Map<string, number>();
    for (const a of yearVacations) {
      const s = maxDate(parseYMD(a.start_date), yearStart);
      const e = minDate(parseYMD(a.end_date), yearEnd);
      const days = calendarDaysBetween(s, e) + 1;
      counts.set(a.staff_id, (counts.get(a.staff_id) ?? 0) + days);
    }
    return Array.from(counts.entries())
      .map(([id, days]) => ({
        staff: staffMap.get(id),
        id,
        days,
      }))
      .filter((row) => row.staff)
      .sort((a, b) => (a.staff!.first_name + a.staff!.last_name).localeCompare(
        b.staff!.first_name + b.staff!.last_name
      ));
  }, [yearVacations, staffMap, year]);

  // "Currently on vacation" — absences (any category) active today.
  const currentlyOn = useMemo(() => {
    const today = dateKeyLocal(new Date());
    return absences
      .filter((a) => a.start_date <= today && a.end_date >= today)
      .map((a) => ({ absence: a, staff: staffMap.get(a.staff_id) }))
      .filter((r) => r.staff);
  }, [absences, staffMap]);

  // Intersection count for legend
  const intersectionCount = useMemo(() => {
    let n = 0;
    for (const [, list] of absencesByDay) {
      if (list.length >= 2) n += 1;
    }
    return n;
  }, [absencesByDay]);

  return (
    <div className="year-view-grid">
      {/* LEFT — vacation list */}
      <div className="card" style={{ padding: "20px 18px" }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700 }}>
          Списки по сотрудникам
        </h3>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: 10 }}>
          ВСЕГО: {yearVacations.length}
        </div>
        {yearVacations.length === 0 ? (
          <div style={{ padding: "14px 0", fontSize: 13, color: "var(--text-muted)" }}>
            Нет заявок на отпуск в {year}.
          </div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, maxHeight: 540, overflowY: "auto" }}>
            {yearVacations.map((a) => {
              const s = staffMap.get(a.staff_id);
              const name = s ? `${s.first_name} ${s.last_name}` : "—";
              return (
                <li
                  key={a.id}
                  style={{
                    display: "flex",
                    gap: 10,
                    padding: "10px 0",
                    borderTop: "1px solid var(--border)",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 3,
                      background: employeeColor(a.staff_id),
                      flexShrink: 0,
                      marginTop: 4,
                    }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {name}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {formatRangeShort(a.start_date, a.end_date)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* RIGHT — months + stats + currently */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div className="card" style={{ padding: "20px 22px" }}>
          <div className="year-months-grid">
            {RU_MONTHS_FULL.map((_, monthIdx) => (
              <MiniMonth
                key={monthIdx}
                year={year}
                monthIdx={monthIdx}
                absencesByDay={absencesByDay}
                staffMap={staffMap}
                onDayClick={(k) => setOpenDayKey(k)}
              />
            ))}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 22,
              paddingTop: 16,
              borderTop: "1px solid var(--border)",
              fontSize: 13,
              color: "var(--text-muted)",
              flexWrap: "wrap",
            }}
          >
            <span
              aria-hidden
              style={{
                width: 22,
                height: 18,
                borderRadius: 4,
                background: OVERLAP_BG,
                flexShrink: 0,
              }}
            />
            <span>
              — дни с пересекающимися заявками от 2+ сотрудников.{" "}
              <strong style={{ color: "var(--text)" }}>{intersectionCount}</strong>{" "}
              таких дней в {year}.
            </span>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--border)", gap: 10 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
              Статистика за {year}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 14, color: "var(--text-muted)" }}>
              <Plane size={16} strokeWidth={2} />
              <Home size={16} strokeWidth={2} />
              <Stethoscope size={16} strokeWidth={2} />
              <Cake size={16} strokeWidth={2} />
            </div>
          </div>
          {staffStats.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              Нет заявок на отпуск.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--bg)", color: "var(--text-muted)", fontSize: 11 }}>
                  <th style={{ textAlign: "left", padding: "10px 22px", fontWeight: 700, letterSpacing: "0.04em" }}>СОТРУДНИК</th>
                  <th style={{ textAlign: "right", padding: "10px 22px", fontWeight: 700, letterSpacing: "0.04em" }}>ДНЕЙ ОТПУСКА</th>
                </tr>
              </thead>
              <tbody>
                {staffStats.map((row) => (
                  <tr key={row.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 22px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 3,
                            background: employeeColor(row.id),
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontWeight: 600 }}>
                          {row.staff!.first_name} {row.staff!.last_name}
                        </span>
                        {row.staff!.title ? (
                          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                            · {row.staff!.title}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td style={{ padding: "12px 22px", textAlign: "right", fontWeight: 700 }}>
                      {row.days}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card" style={{ padding: "18px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
              Сейчас в отпуске:
            </h3>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "3px 10px",
                borderRadius: 999,
                background: "var(--primary-bg)",
                color: "var(--primary)",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {currentlyOn.length} чел.
            </span>
          </div>
          {currentlyOn.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Сегодня все на месте.
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {currentlyOn.map((r) => (
                <li
                  key={r.absence.id}
                  style={{
                    display: "flex",
                    gap: 10,
                    padding: "10px 0",
                    borderTop: "1px solid var(--border)",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      background: employeeColor(r.absence.staff_id),
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>
                      {r.staff!.first_name} {r.staff!.last_name}
                    </span>
                    <span style={{ marginLeft: 8, fontSize: 12, color: "var(--text-muted)" }}>
                      {formatRangeShort(r.absence.start_date, r.absence.end_date)}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 999,
                      background:
                        r.absence.category === "sick"
                          ? "var(--sick-bg)"
                          : r.absence.category === "remote"
                            ? "var(--remote-bg)"
                            : "var(--holiday-bg)",
                      color:
                        r.absence.category === "sick"
                          ? "var(--sick)"
                          : r.absence.category === "remote"
                            ? "var(--remote)"
                            : "var(--holiday)",
                    }}
                  >
                    {r.absence.category === "sick"
                      ? "Sick"
                      : r.absence.category === "remote"
                        ? "Remote"
                        : r.absence.category === "birthday_leave"
                          ? "B-day"
                          : "Отпуск"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {openDayKey ? (
        <DayAbsencesModal
          dayKey={openDayKey}
          entries={absencesByDay.get(openDayKey) ?? []}
          staffMap={staffMap}
          onClose={closeModal}
        />
      ) : null}

      <style>{`
        .year-view-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 24px;
          align-items: flex-start;
          max-width: 1440px;
          margin: 0 auto;
        }
        .year-months-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 16px;
        }
        @media (max-width: 1280px) {
          .year-months-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
        @media (max-width: 1000px) {
          .year-view-grid {
            grid-template-columns: 1fr;
          }
          .year-months-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (max-width: 700px) {
          .year-months-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
}

function DayAbsencesModal({
  dayKey,
  entries,
  staffMap,
  onClose,
}: {
  dayKey: string;
  entries: AbsenceRow[];
  staffMap: Map<string, StaffProfile>;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-absence-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 110,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          border: "none",
          background: "rgba(15, 23, 42, 0.45)",
          cursor: "pointer",
        }}
      />
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 480,
          maxHeight: "min(80vh, 640px)",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
        }}
      >
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h2
              id="day-absence-title"
              style={{ margin: 0, fontSize: 16, fontWeight: 700, textTransform: "capitalize" }}
            >
              {formatFullDateRu(dayKey)}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
              Отсутствует{" "}
              <strong style={{ color: "var(--text)" }}>{entries.length}</strong>{" "}
              {entries.length === 1 ? "сотрудник" : entries.length < 5 ? "сотрудника" : "сотрудников"}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            aria-label="Close dialog"
            style={{ padding: 8, minWidth: 40, borderRadius: "var(--radius-sm)" }}
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ overflowY: "auto", flex: 1, minHeight: 0, padding: "4px 0" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {entries.map((a) => {
              const s = staffMap.get(a.staff_id);
              const name = s ? `${s.first_name} ${s.last_name}` : "—";
              const pill = categoryPillBg(a.category);
              return (
                <li
                  key={a.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 20px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span
                    style={{
                      width: 4,
                      alignSelf: "stretch",
                      borderRadius: 3,
                      background: employeeColor(a.staff_id),
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                      {s?.title ? `${s.title} · ` : ""}
                      {formatRangeShort(a.start_date, a.end_date)}
                      {a.label ? ` · ${a.label}` : ""}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: pill.bg,
                      color: pill.color,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {categoryLabel(a.category)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MiniMonth({
  year,
  monthIdx,
  absencesByDay,
  staffMap,
  onDayClick,
}: {
  year: number;
  monthIdx: number;
  absencesByDay: Map<string, AbsenceRow[]>;
  staffMap: Map<string, StaffProfile>;
  onDayClick: (dayKey: string) => void;
}) {
  const cells = useMemo(() => buildMonthGrid(year, monthIdx), [year, monthIdx]);

  return (
    <div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          textAlign: "center",
          color: "var(--text)",
          marginBottom: 6,
          letterSpacing: "0.02em",
        }}
      >
        {RU_MONTHS_FULL[monthIdx]}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: 2,
        }}
      >
        {WEEK_HEADERS.map((h) => (
          <div
            key={h}
            style={{
              fontSize: 9,
              fontWeight: 700,
              textAlign: "center",
              color: "var(--text-muted)",
              letterSpacing: "0.04em",
              paddingBottom: 2,
            }}
          >
            {h}
          </div>
        ))}
        {cells.map((cell, i) => {
          const k = dateKeyLocal(cell.d);
          const list = absencesByDay.get(k) ?? [];
          const inMonth = cell.inMonth;
          const dayOfWeek = (cell.d.getDay() + 6) % 7;
          const isWeekend = dayOfWeek >= 5;

          let bg: string;
          let color = "var(--text)";
          let fontWeight: number = 500;
          if (list.length === 0) {
            bg = inMonth ? (isWeekend ? "#f1f5f9" : "transparent") : "transparent";
          } else if (list.length === 1) {
            bg = employeeColor(list[0].staff_id);
            color = "#fff";
            fontWeight = 700;
          } else {
            bg = OVERLAP_BG;
            color = "#fff";
            fontWeight = 700;
          }

          const tooltip =
            list.length > 0
              ? list
                  .map((a) => {
                    const s = staffMap.get(a.staff_id);
                    return s ? `${s.first_name} ${s.last_name}` : "—";
                  })
                  .join(", ")
              : undefined;

          const isClickable = inMonth && list.length > 0;
          return (
            <div
              key={i}
              title={tooltip}
              role={isClickable ? "button" : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onClick={isClickable ? () => onDayClick(k) : undefined}
              onKeyDown={
                isClickable
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onDayClick(k);
                      }
                    }
                  : undefined
              }
              style={{
                aspectRatio: "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight,
                color,
                background: bg,
                border: inMonth ? "1px solid var(--border)" : "none",
                borderRadius: 3,
                opacity: inMonth ? 1 : 0.3,
                cursor: isClickable ? "pointer" : "default",
                transition: "transform 0.1s",
              }}
              onMouseEnter={(e) => {
                if (isClickable) e.currentTarget.style.transform = "scale(1.08)";
              }}
              onMouseLeave={(e) => {
                if (isClickable) e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {cell.d.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
