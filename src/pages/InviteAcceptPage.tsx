import { useEffect, useState, type FormEvent } from "react";
import { Lock, ShieldCheck, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { MelonStaffMark } from "../components/MelonStaffMark";

const MIN_LENGTH = 6;

type InviteTarget = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  invite_expires_at: string | null;
};

type Status =
  | { kind: "loading" }
  | { kind: "ready"; target: InviteTarget }
  | { kind: "invalid"; reason: string }
  | { kind: "expired"; when: string }
  | { kind: "done" };

export function InviteAcceptPage({ token }: { token: string }) {
  const { signInDirect } = useAuth();
  const [status, setStatus] = useState<Status>({ kind: "loading" });
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!supabase) {
        if (alive) setStatus({ kind: "invalid", reason: "Supabase не подключён." });
        return;
      }
      const { data, error } = await supabase
        .from("staff_profiles")
        .select("id, email, first_name, last_name, invite_expires_at")
        .eq("invite_token", token)
        .maybeSingle();
      if (!alive) return;
      if (error) {
        setStatus({ kind: "invalid", reason: error.message });
        return;
      }
      if (!data) {
        setStatus({ kind: "invalid", reason: "Ссылка недействительна или уже использована." });
        return;
      }
      if (data.invite_expires_at && new Date(data.invite_expires_at).getTime() < Date.now()) {
        setStatus({ kind: "expired", when: data.invite_expires_at });
        return;
      }
      setStatus({ kind: "ready", target: data as InviteTarget });
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  function clearInviteParam() {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("invite");
      window.history.replaceState({}, "", url.toString());
    } catch {
      // ignore
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (status.kind !== "ready") return;
    if (pw1.length < MIN_LENGTH) {
      setErr(`Пароль должен быть не короче ${MIN_LENGTH} символов.`);
      return;
    }
    if (pw1 !== pw2) {
      setErr("Пароли не совпадают.");
      return;
    }
    if (pw1 === "melon_user") {
      setErr("Нельзя использовать дефолтный пароль — придумайте свой.");
      return;
    }
    if (!supabase) {
      setErr("Supabase не подключён.");
      return;
    }
    setBusy(true);
    setErr(null);
    const target = status.target;
    const { error } = await supabase
      .from("staff_profiles")
      .update({
        password: pw1,
        must_change_password: false,
        invite_token: null,
        invite_expires_at: null,
        login: target.email,
      })
      .eq("id", target.id);
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setStatus({ kind: "done" });
    clearInviteParam();
    signInDirect(target.id);
  }

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
Приглашение
            </div>
          </div>
        </div>

        {status.kind === "loading" ? (
          <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "14px 0" }}>Проверяем приглашение…</div>
        ) : status.kind === "invalid" ? (
          <InviteError title="Недействительная ссылка" message={status.reason} />
        ) : status.kind === "expired" ? (
          <InviteError
            title="Ссылка истекла"
            message={`Приглашение истекло ${new Date(status.when).toLocaleString("ru-RU")}. Попросите администратора выслать новое.`}
          />
        ) : status.kind === "ready" ? (
          <>
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
              Приглашение в портал
            </div>
            <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>
              {status.target.first_name || status.target.email}, добро пожаловать
            </h1>
            <p style={{ margin: "0 0 22px", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
              Задайте пароль — он понадобится для следующих входов. Логин: <strong style={{ color: "var(--text)" }}>{status.target.email}</strong>.
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
                label="Придумайте пароль"
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
                {busy ? "Входим…" : "Задать пароль и войти"}
              </button>
            </form>
          </>
        ) : null}
      </div>
    </div>
  );
}

function InviteError({ title, message }: { title: string; message: string }) {
  return (
    <div
      style={{
        padding: "18px 16px",
        borderRadius: "var(--radius-sm)",
        background: "#fef2f2",
        border: "1px solid #fecaca",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        color: "#7f1d1d",
      }}
    >
      <AlertTriangle size={18} color="#b91c1c" style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 13, lineHeight: 1.5 }}>{message}</div>
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
