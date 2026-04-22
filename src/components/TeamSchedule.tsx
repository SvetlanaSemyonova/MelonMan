import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePortalData } from "../context/PortalDataContext";
import type { ScheduleBlockType } from "../data/scheduleAbsencesMock";
import {
  addDays,
  addMonthsFirstDay,
  clipSegmentToMonth,
  clipSegmentToWeek,
  formatMonthYear,
  formatWeekRange,
  parseYMD,
  startOfWeekMonday,
} from "../lib/calendarUtils";

const typeColors: Record<
  ScheduleBlockType,
  { bg: string; border: string; text: string }
> = {
  holiday: { bg: "rgba(153, 15, 250, 0.15)", border: "var(--holiday)", text: "#7c08c4" },
  sick: { bg: "rgba(220, 38, 38, 0.14)", border: "var(--sick)", text: "#b91c1c" },
  remote: { bg: "rgba(107, 114, 128, 0.18)", border: "var(--remote)", text: "#4b5563" },
  bday: { bg: "rgba(230, 0, 118, 0.14)", border: "var(--birthday)", text: "#be185d" },
};

const dayHeaderFmt = new Intl.DateTimeFormat("ru-RU", { weekday: "short", day: "numeric" });
const WEEK_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;

function isWeekendColumn(year: number, monthIndex: number, dayOfMonth: number): boolean {
  const d = new Date(year, monthIndex, dayOfMonth);
  const monBased = (d.getDay() + 6) % 7;
  return monBased >= 5;
}

export function TeamSchedule() {
  const { schedulePeople } = usePortalData();
  const [view, setView] = useState<"weekly" | "monthly">("weekly");
  const [anchor, setAnchor] = useState(() => new Date());

  const weekMonday = useMemo(() => startOfWeekMonday(anchor), [anchor]);
  const monthYear = anchor.getFullYear();
  const monthIndex = anchor.getMonth();
  const daysInMonth = new Date(monthYear, monthIndex + 1, 0).getDate();

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekMonday, i)),
    [weekMonday]
  );

  const rangeLabel =
    view === "weekly"
      ? formatWeekRange(weekMonday, "ru-RU")
      : formatMonthYear(monthYear, monthIndex, "ru-RU");

  function goPrev() {
    if (view === "weekly") {
      setAnchor(addDays(weekMonday, -7));
    } else {
      const n = addMonthsFirstDay(monthYear, monthIndex, -1);
      setAnchor(n);
    }
  }

  function goNext() {
    if (view === "weekly") {
      setAnchor(addDays(weekMonday, 7));
    } else {
      const n = addMonthsFirstDay(monthYear, monthIndex, 1);
      setAnchor(n);
    }
  }

  function goThisPeriod() {
    const t = new Date();
    if (view === "weekly") {
      setAnchor(startOfWeekMonday(t));
    } else {
      setAnchor(new Date(t.getFullYear(), t.getMonth(), 1));
    }
  }

  const weeklyBars = useMemo(() => {
    return schedulePeople.map((row) => ({
      ...row,
      bars: row.segments
        .map((seg, si) => {
          const clip = clipSegmentToWeek(parseYMD(seg.start), parseYMD(seg.end), weekMonday);
          if (!clip) return null;
          return {
            key: `${row.id}-${si}-${seg.start}`,
            start: clip.startCol,
            span: clip.span,
            label: seg.label,
            type: seg.type,
          };
        })
        .filter(Boolean) as {
        key: string;
        start: number;
        span: number;
        label: string;
        type: ScheduleBlockType;
      }[],
    }));
  }, [weekMonday]);

  const monthlyBars = useMemo(() => {
    return schedulePeople.map((row) => ({
      ...row,
      bars: row.segments
        .map((seg, si) => {
          const clip = clipSegmentToMonth(parseYMD(seg.start), parseYMD(seg.end), monthYear, monthIndex);
          if (!clip) return null;
          return {
            key: `${row.id}-${si}-${seg.start}`,
            start: clip.startCol,
            span: clip.span,
            label: seg.label,
            type: seg.type,
          };
        })
        .filter(Boolean) as {
        key: string;
        start: number;
        span: number;
        label: string;
        type: ScheduleBlockType;
      }[],
    }));
  }, [monthYear, monthIndex]);

  const colCount = view === "weekly" ? 7 : daysInMonth;
  const rows = view === "weekly" ? weeklyBars : monthlyBars;

  return (
    <div className="card" style={{ padding: "22px 24px", marginBottom: 24, overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>График отпусков команды</h2>
        <div
          style={{
            display: "inline-flex",
            padding: 3,
            background: "var(--bg)",
            borderRadius: 8,
            border: "1px solid var(--border)",
          }}
        >
          {(["weekly", "monthly"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className="btn"
              style={{
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 600,
                textTransform: "capitalize",
                background: view === v ? "var(--primary)" : "transparent",
                color: view === v ? "#fff" : "var(--text-muted)",
                border: "none",
                borderRadius: 6,
              }}
            >
              {v === "weekly" ? "Неделя" : "Месяц"}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            className="btn btn-secondary"
            aria-label="Previous"
            onClick={goPrev}
            style={{ padding: "6px 10px" }}
          >
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--primary)", minWidth: 160, textAlign: "center" }}>
            {rangeLabel}
          </span>
          <button
            type="button"
            className="btn btn-secondary"
            aria-label="Next"
            onClick={goNext}
            style={{ padding: "6px 10px" }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <button type="button" className="btn btn-secondary" onClick={goThisPeriod} style={{ fontSize: 12, fontWeight: 600 }}>
          {view === "weekly" ? "Эта неделя" : "Этот месяц"}
        </button>
      </div>

      <div style={{ overflowX: view === "monthly" ? "auto" : undefined }}>
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            overflow: "hidden",
            minWidth: view === "monthly" ? Math.max(640, colCount * 22) : undefined,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `minmax(128px, 150px) repeat(${colCount}, minmax(0, 1fr))`,
            }}
          >
            <div
              style={{
                padding: "10px 12px",
                background: "var(--bg)",
                fontWeight: 600,
                fontSize: 12,
                color: "var(--text-muted)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              Сотрудник
            </div>
            {view === "weekly"
              ? weekDays.map((d) => (
                  <div
                    key={d.getTime()}
                    style={{
                      padding: "10px 4px",
                      textAlign: "center",
                      background: "var(--bg)",
                      fontWeight: 600,
                      fontSize: 10,
                      color: "var(--text-muted)",
                      borderBottom: "1px solid var(--border)",
                      borderLeft: "1px solid var(--border)",
                      lineHeight: 1.25,
                    }}
                  >
                    {dayHeaderFmt.format(d)}
                  </div>
                ))
              : Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const wknd = isWeekendColumn(monthYear, monthIndex, day);
                  const d = new Date(monthYear, monthIndex, day);
                  return (
                    <div
                      key={day}
                      style={{
                        padding: "8px 2px",
                        textAlign: "center",
                        background: "var(--bg)",
                        fontWeight: 600,
                        fontSize: 9,
                        color: "var(--text-muted)",
                        borderBottom: "1px solid var(--border)",
                        borderLeft: "1px solid var(--border)",
                        lineHeight: 1.2,
                        opacity: wknd ? 0.75 : 1,
                      }}
                    >
                      <div>{day}</div>
                      <div style={{ fontSize: 8 }}>{WEEK_SHORT[(d.getDay() + 6) % 7]}</div>
                    </div>
                  );
                })}
          </div>

          {rows.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
              Нет сотрудников в базе — добавьте их в разделе «Админ».
            </div>
          ) : null}
          {rows.map((row) => (
            <div
              key={row.id}
              style={{
                display: "grid",
                gridTemplateColumns: `minmax(128px, 150px) repeat(${colCount}, minmax(0, 1fr))`,
                borderTop: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  padding: "14px 12px",
                  fontWeight: 500,
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  background: "var(--surface)",
                }}
              >
                {row.name}
              </div>
              <div
                style={{
                  gridColumn: `2 / -1`,
                  display: "grid",
                  gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
                  position: "relative",
                  minHeight: view === "monthly" ? 56 : 52,
                  background: "var(--surface)",
                }}
              >
                {view === "weekly"
                  ? weekDays.map((d, i) => {
                      const monBased = (d.getDay() + 6) % 7;
                      const wknd = monBased >= 5;
                      return (
                        <div
                          key={i}
                          style={{
                            borderLeft: "1px solid var(--border)",
                            background: wknd ? "#fafafa" : "transparent",
                          }}
                        />
                      );
                    })
                  : Array.from({ length: daysInMonth }, (_, i) => {
                      const wknd = isWeekendColumn(monthYear, monthIndex, i + 1);
                      return (
                        <div
                          key={i}
                          style={{
                            borderLeft: "1px solid var(--border)",
                            background: wknd ? "#fafafa" : "transparent",
                          }}
                        />
                      );
                    })}
                {row.bars.map((b) => {
                  const c = typeColors[b.type];
                  const left = (b.start / colCount) * 100;
                  const width = (b.span / colCount) * 100;
                  return (
                    <div
                      key={b.key}
                      style={{
                        position: "absolute",
                        left: `calc(${left}% + 3px)`,
                        width: `calc(${width}% - 6px)`,
                        top: 8,
                        height: view === "monthly" ? 38 : 34,
                        background: c.bg,
                        borderLeft: `3px solid ${c.border}`,
                        borderRadius: 6,
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: 6,
                        paddingRight: 4,
                        fontSize: view === "monthly" ? 8 : 10,
                        fontWeight: 600,
                        color: c.text,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={b.label}
                    >
                      {b.label}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
