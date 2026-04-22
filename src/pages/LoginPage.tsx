import { useState, type FormEvent } from "react";
import { Lock, User, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { MelonStaffMark } from "../components/MelonStaffMark";

export function LoginPage() {
  const { signIn } = useAuth();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!login.trim() || !password) {
      setErr("Введите логин и пароль.");
      return;
    }
    setBusy(true);
    setErr(null);
    const res = await signIn(login.trim(), password);
    setBusy(false);
    if (!res.ok) setErr(res.error);
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
          maxWidth: 420,
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
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <MelonStaffMark size={44} />
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--primary)", letterSpacing: "-0.02em" }}>
              MelonStaff
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", color: "var(--text-muted)", textTransform: "uppercase", marginTop: 2 }}>
              Management Suite
            </div>
          </div>
        </div>

        <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>
          Вход в портал
        </h1>
        <p style={{ margin: "0 0 22px", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
          Введите выданные HR-отделом учётные данные.
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
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-muted)" }}>
              Логин
            </span>
            <div style={{ position: "relative" }}>
              <User size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input
                autoFocus
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Admin"
                autoComplete="username"
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

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-muted)" }}>
              Пароль
            </span>
            <div style={{ position: "relative" }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
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
            <LogIn size={16} strokeWidth={2.5} />
            {busy ? "Входим…" : "Войти"}
          </button>
        </form>

        <div
          style={{
            marginTop: 22,
            padding: "10px 14px",
            borderRadius: "var(--radius-sm)",
            background: "var(--gradient-subtle)",
            border: "1px dashed var(--border)",
            fontSize: 12,
            color: "var(--text-muted)",
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: "var(--text)" }}>Demo:</strong> логин{" "}
          <code style={{ padding: "1px 6px", background: "rgba(0,0,0,0.04)", borderRadius: 4 }}>Admin</code>, пароль{" "}
          <code style={{ padding: "1px 6px", background: "rgba(0,0,0,0.04)", borderRadius: 4 }}>Admin</code>.
        </div>
      </div>
    </div>
  );
}
