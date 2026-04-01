import { useState } from "react";
import { Gift, Flag, Sparkles } from "lucide-react";
import { usePortalData } from "../context/PortalDataContext";
import { getUpcomingNationalHolidaysFromDb } from "../lib/nationalHolidaysFromDb";
import { BirthdayCalendarModal } from "./BirthdayCalendarModal";
import { NationalHolidaysCalendarModal } from "./NationalHolidaysCalendarModal";

function ToggleRow({
  label,
  defaultOn = true,
}: {
  label: string;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 0",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn(!on)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 999,
          border: "none",
          padding: 2,
          background: on ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)",
          cursor: "pointer",
          position: "relative",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: on ? 22 : 2,
            top: 2,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.15s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        />
      </button>
    </div>
  );
}

export function RightSidebar() {
  const { staff, nationalHolidays, upcomingBirthdaysWidget } = usePortalData();
  const [birthdayModalOpen, setBirthdayModalOpen] = useState(false);
  const [nationalModalOpen, setNationalModalOpen] = useState(false);
  const nationalWidgetItems = getUpcomingNationalHolidaysFromDb(nationalHolidays, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <button
        type="button"
        className="card"
        onClick={() => setBirthdayModalOpen(true)}
        style={{
          padding: "18px 18px 8px",
          borderColor: "var(--birthday)",
          background: "linear-gradient(180deg, var(--birthday-bg) 0%, var(--surface) 48%)",
          cursor: "pointer",
          textAlign: "left",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Gift size={18} color="var(--birthday)" />
          <span style={{ fontWeight: 700, fontSize: 15 }}>Upcoming Birthdays</span>
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "var(--birthday)",
            marginBottom: 10,
          }}
        >
          THIS WEEK
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {upcomingBirthdaysWidget.length === 0 ? (
            <li style={{ padding: "14px 0", fontSize: 13, color: "var(--text-muted)" }}>
              Укажите дни рождения у сотрудников (админка или таблица).
            </li>
          ) : null}
          {upcomingBirthdaysWidget.map((b) => (
            <li
              key={b.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 0",
                borderTop: "1px solid var(--border)",
              }}
            >
              <div
                className="avatar avatar-sm"
                style={{
                  background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
                  color: "var(--birthday)",
                }}
              >
                {b.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{b.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {b.date} · {b.detail}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </button>

      <BirthdayCalendarModal
        open={birthdayModalOpen}
        onClose={() => setBirthdayModalOpen(false)}
        staff={staff}
      />

      <button
        type="button"
        className="card"
        onClick={() => setNationalModalOpen(true)}
        style={{
          padding: "18px 18px 8px",
          cursor: "pointer",
          textAlign: "left",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Flag size={18} color="var(--navy)" />
          <span style={{ fontWeight: 700, fontSize: 15 }}>National Holidays</span>
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {nationalWidgetItems.map((h) => (
            <li
              key={h.id}
              style={{
                padding: "12px 0",
                borderTop: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{h.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {h.date}
                  <span style={{ color: "var(--border)", margin: "0 6px" }}>·</span>
                  <span style={{ fontWeight: 500 }}>{h.country}</span>
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--holiday)", whiteSpace: "nowrap" }}>
                {h.countdown}
              </span>
            </li>
          ))}
        </ul>
      </button>

      <NationalHolidaysCalendarModal
        open={nationalModalOpen}
        onClose={() => setNationalModalOpen(false)}
        nationalRows={nationalHolidays}
      />

      <div
        style={{
          borderRadius: "var(--radius)",
          background: "linear-gradient(160deg, var(--navy) 0%, #243a5e 100%)",
          color: "#fff",
          padding: "20px 18px",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Sparkles size={18} color="#93c5fd" />
          <span style={{ fontWeight: 700, fontSize: 15 }}>Lead Insights</span>
        </div>
        <p style={{ margin: "0 0 8px", fontSize: 12, opacity: 0.85, lineHeight: 1.45 }}>
          Notification preferences for your team.
        </p>
        <ToggleRow label="Instant Sick Alerts" />
        <ToggleRow label="Weekly OOO Digest" />
        <ToggleRow label="Birthday Reminders" defaultOn />
        <button
          type="button"
          className="btn"
          style={{
            width: "100%",
            marginTop: 16,
            background: "rgba(255,255,255,0.12)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          Open All Settings
        </button>
      </div>
    </div>
  );
}
