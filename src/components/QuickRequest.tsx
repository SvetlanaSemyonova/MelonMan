import { useEffect, useRef, useState, type FormEvent } from "react";
import { CalendarDays, Check } from "lucide-react";
import { usePortalData } from "../context/PortalDataContext";
import { supabase } from "../lib/supabaseClient";
import { mapQuickRequestTypeToCategory } from "../lib/portalDerive";

const TOAST_MS = 4200;

const absenceTypes = ["Vacation", "Sick Leave", "Remote / OOO", "Personal", "B-Day Leave"];

export function QuickRequest() {
  const { viewer, refetch } = usePortalData();
  const [toast, setToast] = useState<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  function showToast(message: string) {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setToast(message);
    hideTimer.current = setTimeout(() => {
      setToast(null);
      hideTimer.current = null;
    }, TOAST_MS);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const type = (form.elements.namedItem("absenceType") as HTMLSelectElement).value;
    const startDate = (form.elements.namedItem("startDate") as HTMLInputElement).value;
    const endDate = (form.elements.namedItem("endDate") as HTMLInputElement).value;
    if (!viewer) {
      showToast("Нет профиля сотрудника в базе.");
      return;
    }
    if (!supabase) {
      showToast("Supabase не подключён.");
      return;
    }
    if (!startDate || !endDate) {
      showToast("Укажите даты начала и окончания.");
      return;
    }
    const category = mapQuickRequestTypeToCategory(type);
    const { error } = await supabase.from("absences").insert({
      staff_id: viewer.id,
      category,
      label: type,
      start_date: startDate,
      end_date: endDate,
      status: "Pending",
      detail: "Quick Request",
    });
    if (error) {
      showToast(error.message);
      return;
    }
    await refetch();
    showToast(`Заявка отправлена: ${type}`);
    form.reset();
    const today = new Date().toISOString().slice(0, 10);
    (form.elements.namedItem("startDate") as HTMLInputElement).value = today;
    (form.elements.namedItem("endDate") as HTMLInputElement).value = today;
  }

  return (
    <div className="card" style={{ padding: "22px 24px", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h2 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700 }}>Quick Request</h2>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
            Submit a new absence request instantly.
          </p>
        </div>
        <CalendarDays size={22} color="var(--text-muted)" style={{ flexShrink: 0 }} />
      </div>
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 14,
            marginTop: 22,
            alignItems: "end",
          }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>Absence Type</span>
            <select
              name="absenceType"
              defaultValue={absenceTypes[0]}
              style={{
                padding: "10px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                background: "var(--surface)",
              }}
            >
              {absenceTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>Start Date</span>
            <input
              name="startDate"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              style={{
                padding: "10px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
              }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>End Date</span>
            <input
              name="endDate"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              style={{
                padding: "10px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
              }}
            />
          </label>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ height: 42, padding: "0 22px", gridColumn: "1 / -1", justifySelf: "start" }}
          >
            Submit Request
          </button>
        </div>
      </form>
      <button
        type="button"
        aria-label="Add"
        className="btn btn-primary"
        style={{
          position: "absolute",
          right: 20,
          bottom: 20,
          width: 44,
          height: 44,
          padding: 0,
          borderRadius: "50%",
          fontSize: 22,
          lineHeight: 1,
          boxShadow: "var(--shadow-md)",
        }}
      >
        +
      </button>

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: 28,
            right: 28,
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 18px",
            borderRadius: "var(--radius)",
            background: "var(--navy)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            boxShadow: "0 12px 40px rgba(15, 23, 42, 0.35)",
            maxWidth: 360,
            animation: "quickRequestToastIn 0.25s ease-out",
          }}
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Check size={18} strokeWidth={2.5} />
          </span>
          {toast}
        </div>
      ) : null}
      <style>{`
        @keyframes quickRequestToastIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
