import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  Globe,
  ChevronDown,
  Plus,
  Cross,
  Star,
  PartyPopper,
  ChevronLeft,
  ChevronRight,
  CalendarRange,
  Palmtree,
} from "lucide-react";
import { usePortalData } from "../context/PortalDataContext";
import { YearVacationView } from "../components/YearVacationView";
import {
  calendarSubtitle,
  getRenderEventsForDay,
  legendItems,
  type LegendKind,
  type RenderEvent,
  type StoredEvent,
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

const WEEKDAYS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

// Country → flag/emoji. Keys match the `country` column values seeded in migration 004.
const countryFlag: Record<string, string> = {
  Global: "🌍",
  "Польша": "🇵🇱",
  "Беларусь": "🇧🇾",
  "Россия": "🇷🇺",
  "Кипр": "🇨🇾",
  "Сербия": "🇷🇸",
  "Болгария": "🇧🇬",
};

const FILTERABLE_COUNTRIES = [
  "Global",
  "Польша",
  "Беларусь",
  "Россия",
  "Кипр",
  "Сербия",
  "Болгария",
];

function flagFor(country: string | undefined): string {
  if (!country) return "";
  return countryFlag[country] ?? "";
}

// Two visual families: OOO (any personal absence) and Public Holiday (national).
// Birthday stays as a small celebration marker.
const oooStyle = {
  bg: "linear-gradient(90deg, #fce7f3 0%, #fbcfe8 100%)",
  bar: "linear-gradient(90deg, #f9a8d4 0%, #f472b6 100%)",
  text: "#be185d",
  border: "1px solid #f9a8d4",
};

const publicHolidayStyle = {
  bar: "linear-gradient(90deg, #990FFA 0%, #E60076 100%)",
  text: "#7c08c4",
  bgSoft: "#f3e8ff",
};

const birthdayStyle = {
  bg: "#f3e8ff",
  text: "#6b21a8",
  border: "1px solid #d8b4fe",
};

const eventStyle = {
  bg: "var(--primary-bg)",
  text: "#4c1d95",
  border: "1px solid #c4b5fd",
};

function LegendSwatch({ kind }: { kind: LegendKind }) {
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
  if (kind === "ooo") {
    return (
      <span
        style={{
          width: 20,
          height: 14,
          borderRadius: 4,
          background: oooStyle.bg,
          border: oooStyle.border,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <span
      style={{
        width: 20,
        height: 14,
        borderRadius: 4,
        background: publicHolidayStyle.bar,
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

function renderEventChip(ev: RenderEvent) {
  // Public Holiday — prominent purple→pink gradient bar.
  if (ev.kind === "national" && ev.nationalStyle === "bar") {
    const flag = flagFor(ev.country);
    const tooltip = ev.country
      ? `Праздник (${ev.country}) — ${ev.label}`
      : `Праздник — ${ev.label}`;
    return (
      <div
        key={ev.id}
        title={tooltip}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 10,
          fontWeight: 700,
          color: "#fff",
          background: publicHolidayStyle.bar,
          padding: "4px 6px",
          borderRadius: 6,
          lineHeight: 1.2,
          boxShadow: "0 2px 6px -2px rgba(153, 15, 250, 0.4)",
          letterSpacing: "0.02em",
          overflow: "hidden",
        }}
      >
        {flag ? <span style={{ flexShrink: 0 }}>{flag}</span> : null}
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {ev.label}
        </span>
      </div>
    );
  }
  if (ev.kind === "national") {
    const flag = flagFor(ev.country);
    const tooltip = ev.country
      ? `Праздник (${ev.country}) — ${ev.label}`
      : `Праздник — ${ev.label}`;
    return (
      <div
        key={ev.id}
        title={tooltip}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 10,
          fontWeight: 700,
          color: "#fff",
          background: publicHolidayStyle.bar,
          padding: "3px 6px",
          borderRadius: 6,
          lineHeight: 1.2,
          letterSpacing: "0.02em",
          overflow: "hidden",
        }}
      >
        {flag ? <span style={{ flexShrink: 0 }}>{flag}</span> : null}
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {ev.label}
        </span>
      </div>
    );
  }

  // Multi-day vacation — OOO bar spanning days.
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
        title={ev.label ? `OOO — ${ev.label}` : "OOO — Отсутствие"}
        style={{
          height: 22,
          background: oooStyle.bar,
          ...r,
          border: "none",
          display: "flex",
          alignItems: "center",
          paddingLeft: ev.spanRole === "start" || ev.spanRole === "single" ? 6 : 0,
          fontSize: 10,
          fontWeight: 600,
          color: "#fff",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          letterSpacing: "0.02em",
        }}
      >
        {ev.spanRole === "start" || ev.spanRole === "single" ? (ev.label || "OOO") : ""}
      </div>
    );
  }

  // Single-day vacation chip — OOO.
  if (ev.kind === "holiday" && ev.label) {
    return (
      <div
        key={ev.id}
        title={`OOO — Отпуск — ${ev.label}`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 10,
          fontWeight: 600,
          color: oooStyle.text,
          background: oooStyle.bg,
          padding: "3px 6px",
          borderRadius: 6,
          border: oooStyle.border,
        }}
      >
        <Palmtree size={10} strokeWidth={2.5} />
        {ev.label}
      </div>
    );
  }

  // Sick — OOO family, same pink but with cross icon to hint sub-type.
  if (ev.kind === "sick") {
    return (
      <div
        key={ev.id}
        title={`OOO — Больничный — ${ev.label}`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 10,
          fontWeight: 600,
          color: oooStyle.text,
          background: oooStyle.bg,
          padding: "3px 6px",
          borderRadius: 6,
          border: oooStyle.border,
        }}
      >
        <Cross size={10} strokeWidth={3} />
        {ev.label}
      </div>
    );
  }

  // Birthday — small celebration marker.
  if (ev.kind === "birthday") {
    return (
      <div
        key={ev.id}
        title={`День рождения — ${ev.label}`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 10,
          fontWeight: 600,
          color: birthdayStyle.text,
          background: birthdayStyle.bg,
          padding: "3px 6px",
          borderRadius: 6,
          border: birthdayStyle.border,
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
          color: eventStyle.text,
          background: eventStyle.bg,
          padding: "3px 6px",
          borderRadius: 6,
          border: eventStyle.border,
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
  storedEvents,
}: {
  cellDate: Date;
  muted: boolean;
  compact?: boolean;
  storedEvents: StoredEvent[];
}) {
  const list = getRenderEventsForDay(cellDate, storedEvents);
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
      <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700 }}>Легенда</h3>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {legendItems.map((row, idx) => (
          <li
            key={row.key}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "10px 0",
              fontSize: 12,
              color: "var(--text-muted)",
              borderTop: idx === 0 ? "none" : "1px solid var(--border)",
            }}
          >
            <span style={{ paddingTop: 3 }}>
              <LegendSwatch kind={row.kind} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "var(--text)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                {row.label}
                {row.kind === "ooo" ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: oooStyle.text }}>
                    <Palmtree size={11} strokeWidth={2.5} />
                    <Cross size={11} strokeWidth={3} />
                  </span>
                ) : null}
              </div>
              {row.hint ? (
                <div style={{ marginTop: 2, fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>
                  {row.hint}
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TeamPulse({
  efficiencyPct,
  faces,
  extraCount,
}: {
  efficiencyPct: number;
  faces: string[];
  extraCount: number;
}) {
  return (
    <div
      style={{
        borderRadius: "var(--radius)",
        background: "var(--gradient-primary)",
        color: "#fff",
        padding: "20px 18px",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{efficiencyPct}%</div>
      <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.9, marginBottom: 14 }}>
Загрузка на этой неделе
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 14 }}>
        {faces.map((f, i) => (
          <div
            key={`${f}-${i}`}
            className="avatar"
            style={{
              width: 32,
              height: 32,
              fontSize: 10,
              marginLeft: i > 0 ? -8 : 0,
              border: "2px solid var(--primary)",
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
            border: "2px solid var(--primary)",
            zIndex: 0,
          }}
        >
          +{extraCount}
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
В офисе
      </span>
      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.45, opacity: 0.85 }}>
Пик нагрузки ожидается на 4-й неделе из-за Лондонской конференции.
      </p>
    </div>
  );
}

function ComingUp({ line }: { line: string | null }) {
  return (
    <div className="card" style={{ padding: "18px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <PartyPopper size={20} color="var(--birthday)" />
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Ближайшие события</h3>
      </div>
      <p style={{ margin: 0, fontSize: 13, color: "var(--text)", fontWeight: 500, lineHeight: 1.45 }}>
        {line ? (
          <strong style={{ fontWeight: 600 }}>{line}</strong>
        ) : (
          <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>Нет предстоящих дней рождения в базе.</span>
        )}
      </p>
    </div>
  );
}

export function CalendarPage() {
  const { storedEvents, staff, presenceInsights, nextBirthdayLine } = usePortalData();
  const [view, setView] = useState<"month" | "week" | "year">("month");
  const [anchor, setAnchor] = useState(() => new Date());
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(
    () => new Set(FILTERABLE_COUNTRIES)
  );
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const countryMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!countryMenuOpen) return;
    function onClick(e: MouseEvent) {
      if (!countryMenuRef.current) return;
      if (!countryMenuRef.current.contains(e.target as Node)) {
        setCountryMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [countryMenuOpen]);

  const filteredStoredEvents = useMemo(
    () =>
      storedEvents.filter((ev) => {
        if (ev.kind !== "national") return true;
        if (!ev.country) return true;
        return selectedCountries.has(ev.country);
      }),
    [storedEvents, selectedCountries]
  );

  function toggleCountry(c: string) {
    setSelectedCountries((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }

  function countryTriggerLabel(): string {
    if (selectedCountries.size === FILTERABLE_COUNTRIES.length) return "Все страны";
    if (selectedCountries.size === 0) return "Нет стран";
    if (selectedCountries.size === 1) return Array.from(selectedCountries)[0];
    return `${selectedCountries.size} стр.`;
  }

  const teamFaces = staff.slice(0, 4).map((s) => `${s.first_name[0] ?? ""}${s.last_name[0] ?? ""}`.toUpperCase());
  const teamExtra = Math.max(0, staff.length - 4);

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
    view === "year"
      ? `${y} г.`
      : view === "month"
        ? formatMonthYear(y, m, "ru-RU")
        : formatWeekRange(weekMonday, "ru-RU");

  function goPrev() {
    if (view === "year") {
      setAnchor(new Date(y - 1, 0, 1));
    } else if (view === "month") {
      setAnchor(addMonthsFirstDay(y, m, -1));
    } else {
      setAnchor(addDays(weekMonday, -7));
    }
  }

  function goNext() {
    if (view === "year") {
      setAnchor(new Date(y + 1, 0, 1));
    } else if (view === "month") {
      setAnchor(addMonthsFirstDay(y, m, 1));
    } else {
      setAnchor(addDays(weekMonday, 7));
    }
  }

  function goToday() {
    const t = new Date();
    if (view === "year") {
      setAnchor(new Date(t.getFullYear(), 0, 1));
    } else {
      setAnchor(new Date(t.getFullYear(), t.getMonth(), t.getDate()));
    }
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
      <div style={{ maxWidth: 1440, margin: "0 auto 24px" }}>
        <section className="hero-gradient" style={{ marginBottom: 24 }}>
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <div style={{ maxWidth: 560 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: 999,
                  background: "rgba(255, 255, 255, 0.18)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 14,
                }}
              >
                <CalendarRange size={13} />
                {title}
              </div>
              <h1
                style={{
                  margin: "0 0 8px",
                  fontSize: 32,
                  fontWeight: 700,
                  lineHeight: 1.15,
                  letterSpacing: "-0.01em",
                }}
              >
Календарь команды
              </h1>
              <p style={{ margin: 0, fontSize: 15, opacity: 0.88, lineHeight: 1.5 }}>
                {calendarSubtitle}
              </p>
            </div>
          </div>
        </section>
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
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
              <button
                type="button"
                className="btn btn-secondary"
                aria-label="Previous"
                onClick={goPrev}
                style={{ padding: "8px 10px", minWidth: 40 }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                aria-label="Next"
                onClick={goNext}
                style={{ padding: "8px 10px", minWidth: 40 }}
              >
                <ChevronRight size={20} />
              </button>
              {view !== "year" ? (
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500 }}>
                  Месяц
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
              ) : (
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--primary)",
                    padding: "0 4px",
                  }}
                >
                  {title}
                </span>
              )}
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500 }}>
                Год
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
Сегодня
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
              {(["month", "week", "year"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  className="btn"
                  onClick={() => setView(v)}
                  style={{
                    padding: "8px 18px",
                    fontSize: 13,
                    fontWeight: 600,
                    background: view === v ? "var(--primary)" : "transparent",
                    color: view === v ? "#fff" : "var(--text-muted)",
                    border: "none",
                    borderRadius: 8,
                  }}
                >
                  {v === "month" ? "Месяц" : v === "week" ? "Неделя" : "Год"}
                </button>
              ))}
            </div>
            <div style={{ position: "relative" }} ref={countryMenuRef}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCountryMenuOpen((v) => !v)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 14px",
                  fontWeight: 600,
                }}
              >
                <Globe size={18} color="var(--primary)" />
                {countryTriggerLabel()}
                <ChevronDown
                  size={16}
                  color="var(--text-muted)"
                  style={{
                    transform: countryMenuOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.15s",
                  }}
                />
              </button>
              {countryMenuOpen ? (
                <div
                  className="card"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    right: 0,
                    zIndex: 20,
                    minWidth: 240,
                    padding: "10px 6px",
                    boxShadow: "0 20px 48px -16px rgba(15, 23, 42, 0.3)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "2px 10px 8px",
                      borderBottom: "1px solid var(--border)",
                      marginBottom: 6,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedCountries(new Set(FILTERABLE_COUNTRIES))}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--primary)",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
Выбрать все
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCountries(new Set())}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
Очистить
                    </button>
                  </div>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {FILTERABLE_COUNTRIES.map((c) => {
                      const checked = selectedCountries.has(c);
                      return (
                        <li key={c}>
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "8px 10px",
                              borderRadius: 6,
                              cursor: "pointer",
                              fontSize: 13,
                              fontWeight: 500,
                              background: checked ? "var(--primary-bg)" : "transparent",
                              color: checked ? "var(--primary)" : "var(--text)",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleCountry(c)}
                              style={{ width: 14, height: 14, cursor: "pointer" }}
                            />
                            <span style={{ fontSize: 16 }}>{countryFlag[c] ?? ""}</span>
                            <span style={{ flex: 1 }}>{c}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {view === "year" ? (
        <YearVacationView year={y} />
      ) : (
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
                      storedEvents={filteredStoredEvents}
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
                  <DayCell key={i} cellDate={d} muted={false} compact storedEvents={filteredStoredEvents} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <CalendarLegend />
          <TeamPulse
            efficiencyPct={presenceInsights.efficiencyPct}
            faces={teamFaces.length ? teamFaces : ["—"]}
            extraCount={teamExtra}
          />
          <ComingUp line={nextBirthdayLine} />
        </div>
      </div>
      )}

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
          boxShadow: "0 8px 24px rgba(153, 15, 250, 0.35)",
          zIndex: 40,
        }}
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>
    </>
  );
}
