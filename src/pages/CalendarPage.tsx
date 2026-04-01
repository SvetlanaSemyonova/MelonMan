import { useMemo, useState, type CSSProperties } from "react";
import {
  Globe,
  ChevronDown,
  Plus,
  Cross,
  Star,
  PartyPopper,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  calendarSubtitle,
  getRenderEventsForDay,
  legendItems,
  type EventKind,
  type RenderEvent,
} from "../data/calendarMock";
import {
  addDays,
  addMonthsFirstDay,
  buildMonthGrid,
  formatMonthYear,
  formatWeekRange,
  MONTH_NAMES,
  startOfWeekMonday,
  yearRange,
} from "../lib/calendarUtils";

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const eventStyles: Record<
  EventKind,
  { bar?: string; text: string; border?: string }
> = {
  national: {
    bar: "linear-gradient(90deg, #7c3aed 0%, #8b5cf6 100%)",
    text: "#5b21b6",
  },
  sick: {
    bar: "#fce7f3",
    text: "#be185d",
    border: "1px solid #f9a8d4",
  },
  holiday: {
    bar: "linear-gradient(90deg, #bfdbfe 0%, #93c5fd 100%)",
    text: "#1d4ed8",
  },
  birthday: {
    bar: "#e9d5ff",
    text: "#6b21a8",
    border: "1px solid #d8b4fe",
  },
  event: {
    bar: "#dbeafe",
    text: "#1e40af",
    border: "1px solid #93c5fd",
  },
};

function LegendSwatch({ kind }: { kind: EventKind | "birthdayLegend" }) {
  if (kind === "birthdayLegend") {
    return (
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#7c3aed",
            boxShadow: "0 0 0 2px #fff, 0 0 0 3px #e9d5ff",
          }}
        />
        <Star size={12} fill="#a855f7" color="#a855f7" style={{ marginLeft: -2 }} />
      </span>
    );
  }
  const s = eventStyles[kind];
  return (
    <span
      style={{
        width: 14,
        height: 14,
        borderRadius: 4,
        background: s.bar,
        border: s.border || "none",
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

function renderEventChip(ev: RenderEvent) {
  const st = eventStyles[ev.kind];

  if (ev.kind === "national" && ev.nationalStyle === "bar") {
    return (
      <div
        key={ev.id}
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#fff",
          background: st.bar,
          padding: "4px 6px",
          borderRadius: 6,
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {ev.label}
      </div>
    );
  }
  if (ev.kind === "national") {
    return (
      <div
        key={ev.id}
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: st.text,
          padding: "2px 0",
        }}
      >
        {ev.label}
      </div>
    );
  }
  if (ev.kind === "holiday" && ev.spanRole) {
    const r =
      ev.spanRole === "single"
        ? { borderRadius: 6, marginLeft: 0, marginRight: 0 }
        : ev.spanRole === "start"
          ? { borderRadius: "6px 0 0 6px", marginRight: -7 }
          : ev.spanRole === "end"
            ? { borderRadius: "0 6px 6px 0", marginLeft: -7 }
            : { borderRadius: 0, marginLeft: -7, marginRight: -7 };
    return (
      <div
        key={ev.id}
        title="Leave"
        style={{
          height: 22,
          background: st.bar,
          ...r,
          border: "none",
        }}
      />
    );
  }
  if (ev.kind === "holiday" && ev.label) {
    return (
      <div
        key={ev.id}
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: st.text,
          background: "#dbeafe",
          padding: "3px 6px",
          borderRadius: 6,
          border: "1px solid #93c5fd",
        }}
      >
        {ev.label}
      </div>
    );
  }
  if (ev.kind === "sick") {
    return (
      <div
        key={ev.id}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 10,
          fontWeight: 600,
          color: st.text,
          background: st.bar,
          padding: "3px 6px",
          borderRadius: 6,
          border: st.border,
        }}
      >
        <Cross size={10} strokeWidth={3} />
        {ev.label}
      </div>
    );
  }
  if (ev.kind === "birthday") {
    return (
      <div
        key={ev.id}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 10,
          fontWeight: 600,
          color: st.text,
          background: st.bar,
          padding: "3px 6px",
          borderRadius: 6,
          border: st.border,
        }}
      >
        <Star size={10} fill="#a855f7" color="#a855f7" />
        {ev.label}
      </div>
    );
  }
  if (ev.kind === "event") {
    return (
      <div
        key={ev.id}
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: st.text,
          background: st.bar,
          padding: "3px 6px",
          borderRadius: 6,
          border: st.border,
        }}
      >
        {ev.label}
      </div>
    );
  }
  return null;
}

function DayCell({
  cellDate,
  muted,
  compact,
}: {
  cellDate: Date;
  muted: boolean;
  compact?: boolean;
}) {
  const list = getRenderEventsForDay(cellDate);
  const dayNum = cellDate.getDate();

  return (
    <div
      style={{
        minHeight: compact ? 140 : 112,
        borderRight: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        padding: "6px 6px 4px",
        background: muted ? "#f8fafc" : "var(--surface)",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: muted ? "var(--text-muted)" : "var(--text)",
          opacity: muted ? 0.55 : 1,
        }}
      >
        {dayNum}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3, minHeight: 0 }}>
        {list.map((ev) => renderEventChip(ev))}
      </div>
    </div>
  );
}

function CalendarLegend() {
  return (
    <div className="card" style={{ padding: "18px 18px 14px" }}>
      <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700 }}>Legend</h3>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {legendItems.map((row, idx) => (
          <li
            key={row.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 0",
              fontSize: 12,
              color: "var(--text-muted)",
              borderTop: idx === 0 ? "none" : "1px solid var(--border)",
            }}
          >
            <LegendSwatch kind={row.kind === "birthdayLegend" ? "birthdayLegend" : row.kind} />
            <span style={{ color: "var(--text)", fontWeight: 500 }}>{row.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TeamPulse() {
  const faces = ["SJ", "MT", "ER", "AK"];
  return (
    <div
      style={{
        borderRadius: "var(--radius)",
        background: "linear-gradient(160deg, var(--navy) 0%, #243a5e 100%)",
        color: "#fff",
        padding: "20px 18px",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>84%</div>
      <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.9, marginBottom: 14 }}>
        Capacity this week.
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 14 }}>
        {faces.map((f, i) => (
          <div
            key={f}
            className="avatar"
            style={{
              width: 32,
              height: 32,
              fontSize: 10,
              marginLeft: i > 0 ? -8 : 0,
              border: "2px solid #243a5e",
              zIndex: 4 - i,
            }}
          >
            {f}
          </div>
        ))}
        <div
          style={{
            marginLeft: -6,
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 700,
            border: "2px solid #243a5e",
            zIndex: 0,
          }}
        >
          +12
        </div>
      </div>
      <span
        style={{
          display: "inline-block",
          fontSize: 11,
          fontWeight: 600,
          padding: "4px 10px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.15)",
          marginBottom: 12,
        }}
      >
        In Office
      </span>
      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.45, opacity: 0.85 }}>
        High workload expected in Week 4 due to the London Conference.
      </p>
    </div>
  );
}

function ComingUp() {
  return (
    <div className="card" style={{ padding: "18px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <PartyPopper size={20} color="var(--birthday)" />
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Coming Up</h3>
      </div>
      <p style={{ margin: 0, fontSize: 13, color: "var(--text)", fontWeight: 500, lineHeight: 1.45 }}>
        <strong>Marco Rossi</strong> — May 15th{" "}
        <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(demo)</span>
      </p>
    </div>
  );
}

export function CalendarPage() {
  const [view, setView] = useState<"month" | "week">("month");
  const [anchor, setAnchor] = useState(() => new Date(2024, 4, 15));

  const y = anchor.getFullYear();
  const m = anchor.getMonth();

  const years = useMemo(() => yearRange(new Date().getFullYear(), 12), []);

  const monthCells = useMemo(() => buildMonthGrid(y, m), [y, m]);

  const weeks = useMemo(() => {
    const w: (typeof monthCells)[] = [];
    for (let i = 0; i < monthCells.length; i += 7) w.push(monthCells.slice(i, i + 7));
    return w;
  }, [monthCells]);

  const weekMonday = useMemo(() => startOfWeekMonday(anchor), [anchor]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekMonday, i)),
    [weekMonday]
  );

  const title =
    view === "month"
      ? formatMonthYear(y, m)
      : formatWeekRange(weekMonday);

  function goPrev() {
    if (view === "month") {
      setAnchor(addMonthsFirstDay(y, m, -1));
    } else {
      setAnchor(addDays(weekMonday, -7));
    }
  }

  function goNext() {
    if (view === "month") {
      setAnchor(addMonthsFirstDay(y, m, 1));
    } else {
      setAnchor(addDays(weekMonday, 7));
    }
  }

  function goToday() {
    const t = new Date();
    setAnchor(new Date(t.getFullYear(), t.getMonth(), t.getDate()));
  }

  const selectStyle: CSSProperties = {
    padding: "8px 12px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text)",
    cursor: "pointer",
  };

  return (
    <>
      <div style={{ maxWidth: 1440, margin: "0 auto 20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 220px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                aria-label="Previous"
                onClick={goPrev}
                style={{ padding: "8px 10px", minWidth: 40 }}
              >
                <ChevronLeft size={20} />
              </button>
              <h1
                style={{
                  margin: 0,
                  fontSize: 26,
                  fontWeight: 700,
                  color: "var(--navy)",
                  flex: "1 1 auto",
                  minWidth: 0,
                }}
              >
                {title}
              </h1>
              <button
                type="button"
                className="btn btn-secondary"
                aria-label="Next"
                onClick={goNext}
                style={{ padding: "8px 10px", minWidth: 40 }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>{calendarSubtitle}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14, alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500 }}>
                Month
                <select
                  value={m}
                  style={selectStyle}
                  onChange={(e) => setAnchor(new Date(y, Number(e.target.value), 1))}
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={name} value={idx}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500 }}>
                Year
                <select
                  value={y}
                  style={selectStyle}
                  onChange={(e) => setAnchor(new Date(Number(e.target.value), m, 1))}
                >
                  {years.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className="btn btn-secondary" onClick={goToday} style={{ fontWeight: 600 }}>
                Today
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div
              style={{
                display: "inline-flex",
                padding: 3,
                background: "var(--bg)",
                borderRadius: 10,
                border: "1px solid var(--border)",
              }}
            >
              {(["month", "week"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  className="btn"
                  onClick={() => setView(v)}
                  style={{
                    padding: "8px 18px",
                    fontSize: 13,
                    fontWeight: 600,
                    textTransform: "capitalize",
                    background: view === v ? "var(--navy)" : "transparent",
                    color: view === v ? "#fff" : "var(--text-muted)",
                    border: "none",
                    borderRadius: 8,
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                fontWeight: 600,
              }}
            >
              <Globe size={18} color="var(--navy)" />
              United Kingdom
              <ChevronDown size={16} color="var(--text-muted)" />
            </button>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div>
          <div
            className="card"
            style={{
              overflow: "hidden",
              borderRadius: 14,
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                background: "var(--bg)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {WEEKDAYS.map((d, i) => (
                <div
                  key={d}
                  style={{
                    padding: "12px 8px",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    color: "var(--text-muted)",
                    textAlign: "center",
                    borderRight: "1px solid var(--border)",
                  }}
                >
                  {view === "week" ? (
                    <div>
                      <div>{d}</div>
                      <div style={{ fontWeight: 600, color: "var(--text)", marginTop: 4, letterSpacing: 0 }}>
                        {weekDays[i].getDate()}{" "}
                        {MONTH_NAMES[weekDays[i].getMonth()].slice(0, 3)}
                      </div>
                    </div>
                  ) : (
                    d
                  )}
                </div>
              ))}
            </div>
            {view === "month" ? (
              weeks.map((row, wi) => (
                <div
                  key={wi}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  }}
                >
                  {row.map((cell, ci) => (
                    <DayCell
                      key={`${wi}-${ci}`}
                      cellDate={cell.d}
                      muted={!cell.inMonth}
                    />
                  ))}
                </div>
              ))
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                }}
              >
                {weekDays.map((d, i) => (
                  <DayCell key={i} cellDate={d} muted={false} compact />
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <CalendarLegend />
          <TeamPulse />
          <ComingUp />
        </div>
      </div>

      <button
        type="button"
        className="btn btn-primary"
        aria-label="Add event"
        style={{
          position: "fixed",
          right: 28,
          bottom: 28,
          width: 52,
          height: 52,
          borderRadius: "50%",
          padding: 0,
          fontSize: 24,
          lineHeight: 1,
          boxShadow: "0 8px 24px rgba(26, 43, 75, 0.35)",
          zIndex: 40,
        }}
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>
    </>
  );
}
