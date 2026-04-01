import { todaysAbsences, type TodayAbsence } from "../data/mock";

function pillClass(status: TodayAbsence["status"]) {
  if (status === "Holiday") return "pill pill-holiday";
  if (status === "Sick Leave") return "pill pill-sick";
  return "pill pill-remote";
}

export function TodaysAbsences() {
  return (
    <div className="card" style={{ padding: "22px 24px", marginBottom: 24 }}>
      <h2 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700, color: "var(--text)" }}>
        Today&apos;s Absences
      </h2>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {todaysAbsences.map((row) => (
          <li
            key={row.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div className="avatar">{row.initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{row.name}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{row.role}</div>
            </div>
            <span className={pillClass(row.status)}>{row.status}</span>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                minWidth: 130,
                textAlign: "right",
              }}
            >
              {row.detail}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
