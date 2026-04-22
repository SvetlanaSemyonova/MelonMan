import { useState, type FormEvent } from "react";
import { Lock, ShieldCheck, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePortalData } from "../context/PortalDataContext";
import { supabase } from "../lib/supabaseClient";
import { MelonStaffMark } from "../components/MelonStaffMark";

const MIN_LENGTH = 6;

export function ChangePasswordPage() {
  const { viewer, refetch } = usePortalData();
  const { signOut } = useAuth();
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!viewer) return;
    if (pw1.length < MIN_LENGTH) {
      setErr(`Пароль должен быть не короче ${MIN_LENGTH} символов.`);
      return;
    }
    if (pw1 !== pw2) {
      setErr("Пароли не совпадают.");
      return;
    }
    if (pw1 === "melon_user") {
      setErr("Нельзя оставить дефолтный пароль — придумайте свой.");
      return;
    }
    if (!supabase) {
      setErr("Supabase не подключён.");
      return;
    }
    setBusy(true);
    setErr(null);
    const { error } = await supabase
      .from("staff_profiles")
      .update({ password: pw1, must_change_password: false })
      .eq("id", viewer.id);
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    await refetch();
  }

  const name = viewer ? `${viewer.first_name} ${viewer.last_name}`.trim() : "";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background:
          "radial-gradient(circle at 18% 10%, rgba(153, 15, 250, 0.22), transparent 45%)," +
          "radial-gradient(circle at 82% 88%, rgba(230, 0, 118, 0.22), transparent 50%)," +
          "linear-gradient(180deg, #faf5ff 0%, #fdf2f8 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          borderRadius: "var(--radius-lg)",
          padding: "34px 32px",
          background: "rgba(255, 255, 255, 0.72)",
          backdropFilter: "blur(18px) saturate(140%)",
          WebkitBackdropFilter: "blur(18px) saturate(140%)",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          boxShadow:
            "0 30px 60px -20px rgba(153, 15, 250, 0.28), 0 8px 24px -12px rgba(230, 0, 118, 0.2), inset 0 1px 0 rgba(255,255,255,0.85)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <MelonStaffMark size={44} />
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--primary)", letterSpacing: "-0.02em" }}>
              MelonStaff
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", color: "var(--text-muted)", textTransform: "uppercase", marginTop: 2 }}>
Первый вход
            </div>
          </div>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            borderRadius: 999,
            background: "var(--primary-bg)",
            color: "var(--primary)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          <ShieldCheck size={12} />
          Требуется смена пароля
        </div>
        <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>
          Задайте новый пароль
        </h1>
        <p style={{ margin: "0 0 22px", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
          {name ? `Привет, ${name}. ` : ""}Вы вошли с дефолтным паролем. Придумайте свой — он понадобится для следующих входов.
        </p>

        {err ? (
          <div
            role="alert"
            style={{
              marginBottom: 14,
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {err}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <PasswordField
            label="Новый пароль"
            value={pw1}
            onChange={setPw1}
            autoFocus
            autoComplete="new-password"
            placeholder={`минимум ${MIN_LENGTH} символов`}
          />
          <PasswordField
            label="Повторите пароль"
            value={pw2}
            onChange={setPw2}
            autoComplete="new-password"
            placeholder="еще раз"
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={busy}
            style={{
              marginTop: 6,
              padding: "12px 18px",
              fontSize: 14,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <ShieldCheck size={16} strokeWidth={2.5} />
            {busy ? "Сохраняем…" : "Сохранить и войти"}
          </button>
        </form>

        <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
          <button
            type="button"
            onClick={signOut}
            style={{
              background: "none",
              border: "none",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-muted)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: 4,
            }}
          >
            <LogOut size={12} />
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  autoComplete?: string;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-muted)" }}>
        {label}
      </span>
      <div style={{ position: "relative" }}>
        <Lock size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
        <input
          type="password"
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: "11px 12px 11px 36px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            fontSize: 14,
            outline: "none",
            background: "var(--surface)",
          }}
        />
      </div>
    </label>
  );
}
