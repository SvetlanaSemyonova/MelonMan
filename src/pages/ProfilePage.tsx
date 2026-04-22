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
  UserCircle,
  Briefcase,
} from "lucide-react";
import { usePortalData } from "../context/PortalDataContext";
import { formatJoined } from "../lib/portalDerive";

const leaveTypesProfile = ["Отпуск", "Больничный", "Отгул на ДР", "Личные дела"];

function BalanceDonut({
  used,
  total,
  left,
  title,
  color,
}: {
  used: number;
  total: number;
  left: number;
  title: string;
  color: string;
}) {
  const pct = total > 0 ? Math.min(1, used / total) : 0;
  const r = 44;
  const c = 2 * Math.PI * r;
  const dash = c * pct;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, minWidth: 160 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>
        {title}
      </div>
      <div style={{ position: "relative", width: 120, height: 120 }}>
        <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="60" cy="60" r={r} fill="none" stroke="var(--border)" strokeWidth="12" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={color}
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
          <div style={{ fontSize: 20, fontWeight: 700, color, lineHeight: 1.1 }}>{used}</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", marginTop: 2, letterSpacing: "0.04em" }}>
            ИЗ {total} ДН.
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, width: "100%", marginTop: 12 }}>
        <div
          style={{
            flex: 1,
            padding: "8px 10px",
            background: "var(--bg)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-muted)" }}>
            ИСПОЛЬЗОВАНО
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{used}</div>
        </div>
        <div
          style={{
            flex: 1,
            padding: "8px 10px",
            background: "var(--bg)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-muted)" }}>
            ОСТАЛОСЬ
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{left}</div>
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
  const { viewer, absenceHistory, regionalHolidaysProfile, vacationBalance, sickBalance } = usePortalData();
  const u = viewer;

  if (!u) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
        Нет данных профиля. Добавьте сотрудников в Supabase или выполните SQL-миграцию.
      </div>
    );
  }

  return (
    <>
      <div style={{ maxWidth: 1440, margin: "0 auto 24px" }}>
        <section className="hero-gradient" style={{ marginBottom: 28 }}>
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
                <UserCircle size={13} />
                Профиль
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
                {u.first_name}
                {u.middle_name ? ` ${u.middle_name}` : ""} {u.last_name}
              </h1>
              <p style={{ margin: 0, fontSize: 15, opacity: 0.88, lineHeight: 1.5 }}>
Управляйте профилем и балансами отсутствий.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
              <button type="button" className="btn btn-hero-primary">
                <Plus size={16} strokeWidth={2.5} />
Подать заявку
              </button>
            </div>
          </div>
        </section>
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
                  background: "linear-gradient(160deg, #990FFA 0%, #E60076 45%, #f3e8ff 100%)",
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
                    background: "linear-gradient(180deg, #990FFA 0%, #7c08c4 100%)",
                    borderRadius: "40px 40px 0 0",
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                    {u.first_name}
                {u.middle_name ? ` ${u.middle_name}` : ""} {u.last_name}
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
АКТИВЕН
                  </span>
                </div>
                <p style={{ margin: "6px 0 18px", fontSize: 14, color: "var(--text-muted)" }}>
                  {u.title}
                  {u.department ? (
                    <>
                      {u.title ? <span style={{ margin: "0 8px", color: "var(--border)" }}>·</span> : null}
                      <span style={{ color: "var(--primary)", fontWeight: 600 }}>{u.department}</span>
                    </>
                  ) : null}
                </p>
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
Гражданство
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                      <MapPin size={16} color="var(--holiday)" />
                      {u.country_citizenship || "—"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
Проживание
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                      <MapPin size={16} color="var(--primary)" />
                      {u.country_residence || u.region || "—"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
Юрисдикция ИП
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                      <BadgeCheck size={16} color="var(--text-muted)" />
                      {u.country_legal || "—"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
Отдел
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                      <Briefcase size={16} color="var(--primary)" />
                      {u.department || "—"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
ID сотрудника
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                      <BadgeCheck size={16} color="var(--text-muted)" />
                      {u.employee_id || "—"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
Лид
                    </div>
                    <div style={{ fontWeight: 500 }}>{u.manager_name || "—"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
Дата приёма
                    </div>
                    <div style={{ fontWeight: 500 }}>{formatJoined(u.joined_at)}</div>
                  </div>
                </div>
                {u.personal_note ? (
                  <div
                    style={{
                      marginTop: 18,
                      padding: "12px 14px",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--gradient-subtle)",
                      border: "1px solid var(--border)",
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: "var(--text)",
                    }}
                  >
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 6 }}>
ЛИЧНАЯ ЗАМЕТКА
                    </div>
                    {u.personal_note}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: "22px 24px" }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>Баланс отсутствий</h2>
            <p style={{ margin: "0 0 18px", fontSize: 12, color: "var(--text-muted)" }}>
              Доступные дни на {new Date().getFullYear()}.
            </p>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
              <BalanceDonut
                title="Отпуск"
                color="var(--primary)"
                used={vacationBalance.used}
                total={vacationBalance.total}
                left={vacationBalance.left}
              />
              <BalanceDonut
                title="Больничные"
                color="var(--sick)"
                used={sickBalance.used}
                total={sickBalance.total}
                left={sickBalance.left}
              />
            </div>
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
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>История отсутствий</h2>
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
Все отсутствия
                <ChevronDown size={14} />
              </button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--bg)", color: "var(--text-muted)", fontSize: 11, fontWeight: 700 }}>
                  <th style={{ textAlign: "left", padding: "12px 22px", letterSpacing: "0.05em" }}>ТИП</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", letterSpacing: "0.05em" }}>ПЕРИОД</th>
                  <th style={{ textAlign: "right", padding: "12px 22px", letterSpacing: "0.05em" }}>СТАТУС</th>
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
Посмотреть всю историю
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
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Региональные праздники</h2>
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
              {regionalHolidaysProfile.map((h) => (
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
            background: "var(--gradient-primary)",
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
              <CalendarDays size={22} color="var(--primary-bg)" />
              <PenLine
                size={14}
                color="var(--primary-bg)"
                style={{ position: "absolute", bottom: 8, right: 8 }}
                strokeWidth={2.5}
              />
            </div>
            <div>
              <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700 }}>Запланируйте следующий отпуск</h2>
              <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>
Отправьте новую заявку на отсутствие на согласование.
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
              <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.85 }}>Тип отсутствия</span>
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
              <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.85 }}>Дата начала</span>
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
              <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.85 }}>Дата окончания</span>
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
                color: "var(--primary)",
                fontWeight: 700,
                border: "none",
              }}
            >
Отправить заявку
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
