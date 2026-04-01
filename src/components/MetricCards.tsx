import { useCallback, useEffect, useMemo, useState } from "react";
import { Plane, Stethoscope, Home, X } from "lucide-react";
import { metrics } from "../data/mock";
import { randomEmployeeNames } from "../data/metricEmployeeNames";

type MetricKey = "onHoliday" | "sickLeave" | "oooRemote";

const items = [
  {
    key: "onHoliday" as const,
    label: "On Holiday",
    value: metrics.onHoliday,
    icon: Plane,
    color: "var(--holiday)",
    bg: "var(--holiday-bg)",
  },
  {
    key: "sickLeave" as const,
    label: "Sick Leave",
    value: metrics.sickLeave,
    icon: Stethoscope,
    color: "var(--sick)",
    bg: "var(--sick-bg)",
  },
  {
    key: "oooRemote" as const,
    label: "OOO / Remote",
    value: metrics.oooRemote,
    icon: Home,
    color: "var(--remote)",
    bg: "var(--remote-bg)",
  },
];

export function MetricCards() {
  const [openKey, setOpenKey] = useState<MetricKey | null>(null);
  const [listSeed, setListSeed] = useState(0);

  const openModal = useCallback((key: MetricKey) => {
    setListSeed((s) => s + 1);
    setOpenKey(key);
  }, []);

  const closeModal = useCallback(() => setOpenKey(null), []);

  const activeItem = openKey ? items.find((i) => i.key === openKey) : null;
  const employeeList = useMemo(() => {
    if (!openKey || !activeItem) return [];
    const seed =
      (openKey === "onHoliday" ? 1 : openKey === "sickLeave" ? 2 : 3) * 100_000 + listSeed * 17;
    return randomEmployeeNames(activeItem.value, seed);
  }, [openKey, activeItem, listSeed]);

  useEffect(() => {
    if (!openKey) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openKey, closeModal]);

  useEffect(() => {
    if (!openKey) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [openKey]);

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
        className="metric-cards-grid"
      >
        {items.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.key}
              type="button"
              className="card"
              onClick={() => openModal(m.key)}
              style={{
                padding: "20px 22px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                cursor: "pointer",
                textAlign: "left",
                border: "1px solid var(--border)",
                background: "var(--surface)",
                borderRadius: "var(--radius)",
                boxShadow: "var(--shadow)",
                transition: "box-shadow 0.15s, transform 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow)";
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: m.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={22} color={m.color} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", lineHeight: 1.1 }}>
                  {m.value}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500, marginTop: 2 }}>
                  {m.label}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {openKey && activeItem ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="metric-modal-title"
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
            onClick={closeModal}
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
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 440,
              maxHeight: "min(72vh, 560px)",
              display: "flex",
              flexDirection: "column",
              padding: 0,
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "18px 20px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexShrink: 0,
              }}
            >
              <div>
                <h2 id="metric-modal-title" style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                  {activeItem.label}
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
                  {activeItem.value} people in this status
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeModal}
                aria-label="Close dialog"
                style={{ padding: 8, minWidth: 40, borderRadius: "var(--radius-sm)" }}
              >
                <X size={20} />
              </button>
            </div>
            <div
              style={{
                overflowY: "auto",
                padding: "8px 0",
                flex: 1,
                minHeight: 0,
              }}
            >
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {employeeList.map((row, idx) => (
                  <li
                    key={`${row.name}-${idx}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 20px",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <div className="avatar" style={{ width: 40, height: 40, fontSize: 12, flexShrink: 0 }}>
                      {row.initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{row.name}</span>
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: 13,
                          color: "var(--text-muted)",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.untilLabel}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      <style>{`
        @media (max-width: 768px) {
          .metric-cards-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
