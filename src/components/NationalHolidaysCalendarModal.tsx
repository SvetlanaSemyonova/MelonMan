import { useEffect, useMemo, useState } from "react";
import { X, ChevronLeft, ChevronRight, Flag } from "lucide-react";
import type { NationalHolidayRow } from "../lib/portalTypes";
import { nationalHolidaysOnDayFromDb } from "../lib/nationalHolidaysFromDb";
import { addMonthsFirstDay, buildMonthGrid, formatMonthYear } from "../lib/calendarUtils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Props = {
  open: boolean;
  onClose: () => void;
  nationalRows: NationalHolidayRow[];
};

export function NationalHolidaysCalendarModal({ open, onClose, nationalRows }: Props) {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [monthIndex, setMonthIndex] = useState(() => new Date().getMonth());

  useEffect(() => {
    if (!open) return;
    const t = new Date();
    setYear(t.getFullYear());
    setMonthIndex(t.getMonth());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const cells = useMemo(() => buildMonthGrid(year, monthIndex), [year, monthIndex]);
  const today = new Date();
  const isToday = (d: Date) =>
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();

  function goPrev() {
    const n = addMonthsFirstDay(year, monthIndex, -1);
    setYear(n.getFullYear());
    setMonthIndex(n.getMonth());
  }

  function goNext() {
    const n = addMonthsFirstDay(year, monthIndex, 1);
    setYear(n.getFullYear());
    setMonthIndex(n.getMonth());
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="national-cal-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
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
          maxWidth: 540,
          maxHeight: "min(90vh, 680px)",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          overflow: "hidden",
          border: "2px solid var(--holiday)",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
        }}
      >
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid var(--border)",
            background: "linear-gradient(180deg, var(--holiday-bg) 0%, var(--surface) 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "var(--primary-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Flag size={20} color="var(--holiday)" />
              </div>
              <div>
                <h2 id="national-cal-title" style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                  National holidays
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
                  By country · annual dates
                </p>
              </div>
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

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 16,
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              aria-label="Previous month"
              onClick={goPrev}
              style={{ padding: "6px 10px" }}
            >
              <ChevronLeft size={20} />
            </button>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--primary)", minWidth: 200, textAlign: "center" }}>
              {formatMonthYear(year, monthIndex)}
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              aria-label="Next month"
              onClick={goNext}
              style={{ padding: "6px 10px" }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div style={{ overflow: "auto", flex: 1, minHeight: 0 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              background: "var(--bg)",
              borderBottom: "1px solid var(--border)",
              position: "sticky",
              top: 0,
              zIndex: 1,
            }}
          >
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                style={{
                  padding: "10px 4px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textAlign: "center",
                  borderRight: "1px solid var(--border)",
                }}
              >
                {d}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            }}
          >
            {cells.map((cell, idx) => {
              const m = cell.d.getMonth();
              const day = cell.d.getDate();
              const hol = nationalHolidaysOnDayFromDb(nationalRows, m, day);
              const muted = !cell.inMonth;
              const todayCell = isToday(cell.d);

              return (
                <div
                  key={idx}
                  style={{
                    minHeight: 92,
                    borderRight: "1px solid var(--border)",
                    borderBottom: "1px solid var(--border)",
                    padding: "6px 5px 8px",
                    background: muted ? "#fafafa" : "var(--surface)",
                    opacity: muted ? 0.65 : 1,
                    outline: todayCell ? "2px solid var(--holiday)" : "none",
                    outlineOffset: -2,
                    borderRadius: todayCell ? 4 : 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: muted ? "var(--text-muted)" : "var(--text)",
                      marginBottom: 4,
                    }}
                  >
                    {day}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {hol.slice(0, 2).map((h) => (
                      <div
                        key={h.id}
                        title={`${h.name} · ${h.country}`}
                        style={{
                          fontSize: 8,
                          fontWeight: 600,
                          color: "#1e40af",
                          background: "#eff6ff",
                          padding: "3px 5px",
                          borderRadius: 4,
                          border: "1px solid #bfdbfe",
                          lineHeight: 1.25,
                        }}
                      >
                        <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {h.name}
                        </span>
                        <span style={{ opacity: 0.85, fontSize: 7 }}>{h.country}</span>
                      </div>
                    ))}
                    {hol.length > 2 ? (
                      <div style={{ fontSize: 9, fontWeight: 700, color: "var(--holiday)" }}>
                        +{hol.length - 2} more
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
