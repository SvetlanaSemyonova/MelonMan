import {
  MapPin,
  BadgeCheck,
  Palmtree,
  Stethoscope,
  Cake,
  ChevronDown,
  CalendarDays,
  PenLine,
  Plus,
} from "lucide-react";
import {
  profileUser,
  vacationBalance,
  absenceHistory,
  regionalHolidays,
  leaveTypesProfile,
} from "../data/profileMock";

function VacationDonut() {
  const { used, total, left } = vacationBalance;
  const pct = used / total;
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = c * pct;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0 16px" }}>
      <div style={{ position: "relative", width: 140, height: 140 }}>
        <svg width="140" height="140" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="60" cy="60" r={r} fill="none" stroke="var(--border)" strokeWidth="12" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="var(--navy)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--navy)", lineHeight: 1.1 }}>
            {used}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginTop: 2 }}>
            OF {total} DAYS
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, width: "100%", marginTop: 8 }}>
        <div
          style={{
            flex: 1,
            padding: "12px 14px",
            background: "var(--bg)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-muted)" }}>
            USED
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{used}</div>
        </div>
        <div
          style={{
            flex: 1,
            padding: "12px 14px",
            background: "var(--bg)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-muted)" }}>
            LEFT
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{left}</div>
        </div>
      </div>
    </div>
  );
}

function TypeIcon({ variant }: { variant: "vacation" | "medical" | "birthday" }) {
  const common = { size: 18, strokeWidth: 2 as const };
  if (variant === "vacation") return <Palmtree {...common} color="var(--holiday)" />;
  if (variant === "medical") return <Stethoscope {...common} color="var(--sick)" />;
  return <Cake {...common} color="var(--birthday)" />;
}

export function ProfilePage() {
  const u = profileUser;

  return (
    <>
      <div style={{ maxWidth: 1440, margin: "0 auto 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 700, color: "var(--navy)" }}>
              My Profile
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>
              Manage your professional identity and time-off balances.
            </p>
          </div>
          <button type="button" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Plus size={18} strokeWidth={2.5} />
            Request Absence
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1440, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 24,
            alignItems: "stretch",
          }}
          className="profile-top-grid"
        >
          <div className="card" style={{ padding: 24, overflow: "hidden" }}>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <div
                style={{
                  width: 120,
                  height: 140,
                  borderRadius: 12,
                  background: "linear-gradient(160deg, #1e3a5f 0%, #3b82f6 45%, #93c5fd 100%)",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "linear-gradient(180deg, #fcd9b8 0%, #e8b896 100%)",
                    marginBottom: -12,
                    boxShadow: "0 -4px 20px rgba(0,0,0,0.15)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 100,
                    height: 44,
                    background: "linear-gradient(180deg, #1a2b4b 0%, #243a5e 100%)",
                    borderRadius: "40px 40px 0 0",
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                    {u.firstName} {u.lastName}
                  </h2>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: "var(--holiday-bg)",
                      color: "var(--holiday)",
                    }}
                  >
                    ACTIVE
                  </span>
                </div>
                <p style={{ margin: "6px 0 18px", fontSize: 14, color: "var(--text-muted)" }}>{u.title}</p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "14px 24px",
                    fontSize: 13,
                  }}
                  className="profile-details-grid"
                >
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                      Region
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                      <MapPin size={16} color="var(--holiday)" />
                      {u.region}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                      Employee ID
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                      <BadgeCheck size={16} color="var(--text-muted)" />
                      {u.employeeId}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                      Direct Manager
                    </div>
                    <div style={{ fontWeight: 500 }}>{u.manager}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                      Joined Date
                    </div>
                    <div style={{ fontWeight: 500 }}>{u.joined}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: "22px 24px" }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700 }}>Vacation Balance</h2>
            <VacationDonut />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 24,
            alignItems: "stretch",
          }}
          className="profile-mid-grid"
        >
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "18px 22px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Absence History</h2>
              <button
                type="button"
                className="btn btn-secondary"
                style={{
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                All Leaves
                <ChevronDown size={14} />
              </button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--bg)", color: "var(--text-muted)", fontSize: 11, fontWeight: 700 }}>
                  <th style={{ textAlign: "left", padding: "12px 22px", letterSpacing: "0.05em" }}>TYPE</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", letterSpacing: "0.05em" }}>DURATION</th>
                  <th style={{ textAlign: "right", padding: "12px 22px", letterSpacing: "0.05em" }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {absenceHistory.map((row) => (
                  <tr key={row.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "14px 22px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 600 }}>
                        <TypeIcon variant={row.typeVariant} />
                        {row.type}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", color: "var(--text-muted)" }}>{row.duration}</td>
                    <td style={{ padding: "14px 22px", textAlign: "right" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.04em",
                          background: "#dcfce7",
                          color: "#15803d",
                        }}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: "16px", textAlign: "center", borderTop: "1px solid var(--border)" }}>
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--holiday)",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                View Full History
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "18px 22px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Regional Holidays</h2>
              <button
                type="button"
                className="btn btn-secondary"
                style={{
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                Serbia, Belgrade
                <ChevronDown size={14} />
              </button>
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {regionalHolidays.map((h) => (
                <li
                  key={h.id}
                  style={{
                    display: "flex",
                    gap: 16,
                    padding: "16px 22px",
                    borderTop: "1px solid var(--border)",
                    alignItems: "center",
                    opacity: h.variant === "past" ? 0.55 : 1,
                  }}
                >
                  <div
                    style={{
                      minWidth: 56,
                      padding: "10px 8px",
                      borderRadius: "var(--radius-sm)",
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: 12,
                      lineHeight: 1.25,
                      background: h.variant === "upcoming" ? "var(--sick-bg)" : "var(--bg)",
                      color: h.variant === "upcoming" ? "var(--sick)" : "var(--text-muted)",
                      border: h.variant === "past" ? "1px solid var(--border)" : "none",
                    }}
                  >
                    {h.dayLabel.split(" ").map((part, idx) => (
                      <div key={idx}>{part}</div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{h.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{h.meta}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          style={{
            borderRadius: "var(--radius)",
            background: "linear-gradient(135deg, var(--navy) 0%, #243a5e 100%)",
            color: "#fff",
            padding: "24px 28px",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <CalendarDays size={22} color="#93c5fd" />
              <PenLine
                size={14}
                color="#e0e7ff"
                style={{ position: "absolute", bottom: 8, right: 8 }}
                strokeWidth={2.5}
              />
            </div>
            <div>
              <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700 }}>Plan Your Next Break</h2>
              <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>
                Quickly submit a new leave request for approval.
              </p>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 14,
              alignItems: "end",
            }}
          >
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.85 }}>Leave Type</span>
              <select
                defaultValue={leaveTypesProfile[0]}
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  background: "rgba(255,255,255,0.1)",
                  color: "#fff",
                }}
              >
                {leaveTypesProfile.map((t) => (
                  <option key={t} value={t} style={{ color: "var(--text)" }}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.85 }}>Start Date</span>
              <input
                type="text"
                placeholder="mm/dd/yyyy"
                readOnly
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  background: "rgba(255,255,255,0.95)",
                  color: "var(--text)",
                }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.85 }}>End Date</span>
              <input
                type="text"
                placeholder="mm/dd/yyyy"
                readOnly
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  background: "rgba(255,255,255,0.95)",
                  color: "var(--text)",
                }}
              />
            </label>
            <button
              type="button"
              className="btn"
              style={{
                height: 42,
                background: "#fff",
                color: "var(--navy)",
                fontWeight: 700,
                border: "none",
              }}
            >
              Submit Request
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .profile-top-grid,
          .profile-mid-grid {
            grid-template-columns: 1fr !important;
          }
          .profile-details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
