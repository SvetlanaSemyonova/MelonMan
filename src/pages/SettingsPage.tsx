import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { Users, Pencil, X, Check, History, Search, Trash2, Mail, Copy, ExternalLink } from "lucide-react";
import { usePortalData } from "../context/PortalDataContext";
import { supabase } from "../lib/supabaseClient";
import {
  permissionGroups,
  roles,
  type PermissionId,
  type UserRoleId,
} from "../data/adminMock";
import { COUNTRIES_RU } from "../data/countriesRu";
import { DEPARTMENTS } from "../data/departments";
import type { StaffProfile, StaffProfileChangeRow } from "../lib/portalTypes";

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border)",
  fontSize: 14,
  outline: "none",
  background: "var(--surface)",
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--text-muted)",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  marginBottom: 6,
};

const FIELD_LABELS_RU: Record<string, string> = {
  first_name: "Имя",
  middle_name: "Отчество",
  last_name: "Фамилия",
  email: "Email",
  title: "Должность",
  role: "Роль",
  region: "Регион",
  employee_id: "Employee ID",
  manager_name: "Лид",
  joined_at: "Дата начала работы",
  vacation_used: "Дней отпуска использовано",
  vacation_total: "Дней отпуска всего",
  sick_total: "Дней больничного всего",
  birthday: "День рождения",
  country_citizenship: "Гражданство",
  country_residence: "Страна проживания",
  country_legal: "Юрисдикция ИП",
  personal_note: "Персональный комментарий",
  permissions: "Права доступа",
  department: "Отдел",
};

function fieldLabel(key: string): string {
  return FIELD_LABELS_RU[key] ?? key;
}

type EditableProfile = {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  title: string;
  role: UserRoleId;
  region: string;
  employee_id: string;
  manager_name: string;
  joined_at: string;
  vacation_used: number;
  vacation_total: number;
  sick_total: number;
  birthday: string;
  country_citizenship: string;
  country_residence: string;
  country_legal: string;
  personal_note: string;
  department: string;
  permissions: string[];
};

function toEditable(p: StaffProfile): EditableProfile {
  return {
    first_name: p.first_name ?? "",
    middle_name: p.middle_name ?? "",
    last_name: p.last_name ?? "",
    email: p.email ?? "",
    title: p.title ?? "",
    role: p.role,
    region: p.region ?? "",
    employee_id: p.employee_id ?? "",
    manager_name: p.manager_name ?? "",
    joined_at: p.joined_at ?? "",
    vacation_used: p.vacation_used ?? 0,
    vacation_total: p.vacation_total ?? 20,
    sick_total: p.sick_total ?? 10,
    birthday: p.birthday ?? "",
    country_citizenship: p.country_citizenship ?? "",
    country_residence: p.country_residence ?? "",
    country_legal: p.country_legal ?? "",
    personal_note: p.personal_note ?? "",
    department: p.department ?? "",
    permissions: Array.isArray(p.permissions) ? [...p.permissions] : [],
  };
}

function normalise(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (Array.isArray(v)) return [...v].sort().join(",");
  if (typeof v === "number") return String(v);
  return String(v);
}

function diffFields(
  before: EditableProfile,
  after: EditableProfile
): { field: keyof EditableProfile; oldValue: string; newValue: string }[] {
  const fields = Object.keys(before) as (keyof EditableProfile)[];
  const out: { field: keyof EditableProfile; oldValue: string; newValue: string }[] = [];
  for (const f of fields) {
    const a = normalise(before[f]);
    const b = normalise(after[f]);
    if (a !== b) out.push({ field: f, oldValue: a, newValue: b });
  }
  return out;
}

export function SettingsPage() {
  const { staff, viewer, refetch, staffChanges } = usePortalData();
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [invite, setInvite] = useState<{ staff: StaffProfile; url: string; expiresAt: string } | null>(null);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  async function handleSendInvite(target: StaffProfile) {
    if (!supabase) {
      setInviteError("Supabase не подключён.");
      return;
    }
    if (!target.email) {
      setInviteError("У сотрудника не указан email.");
      return;
    }
    setInvitingId(target.id);
    setInviteError(null);
    const token =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID().replace(/-/g, "")
        : Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from("staff_profiles")
      .update({
        invite_token: token,
        invite_expires_at: expiresAt,
        must_change_password: true,
        login: target.email,
      })
      .eq("id", target.id);

    setInvitingId(null);
    if (error) {
      setInviteError(error.message);
      return;
    }
    const base = window.location.origin + window.location.pathname;
    const url = `${base}?invite=${token}`;
    setInvite({ staff: target, url, expiresAt });
    await refetch();
  }

  async function handleDelete(target: StaffProfile) {
    if (!supabase) {
      setDeleteError("Supabase не подключён.");
      return;
    }
    const fullName = `${target.first_name}${target.middle_name ? " " + target.middle_name : ""} ${target.last_name}`.trim();
    const ok = window.confirm(
      `Удалить сотрудника «${fullName || target.email}»?\n\n` +
        "Это безвозвратно удалит:\n" +
        "  • профиль\n" +
        "  • связанные заявки на отсутствие\n" +
        "  • записи в истории изменений, где он субъект\n\n" +
        "Операция необратима."
    );
    if (!ok) return;

    setDeletingId(target.id);
    setDeleteError(null);
    const { error } = await supabase.from("staff_profiles").delete().eq("id", target.id);
    setDeletingId(null);
    if (error) {
      setDeleteError(error.message);
      return;
    }
    await refetch();
  }

  const filteredStaff = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter((s) => {
      return (
        s.first_name.toLowerCase().includes(q) ||
        s.middle_name?.toLowerCase().includes(q) ||
        s.last_name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.title ?? "").toLowerCase().includes(q)
      );
    });
  }, [staff, query]);

  const editingStaff = useMemo(
    () => (editingId ? staff.find((s) => s.id === editingId) ?? null : null),
    [editingId, staff]
  );

  const closeModal = useCallback(() => setEditingId(null), []);

  useEffect(() => {
    if (!editingId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editingId, closeModal]);

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
            <div style={{ maxWidth: 640 }}>
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
                <Users size={13} />
                Settings
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
                Управление сотрудниками
              </h1>
              <p style={{ margin: 0, fontSize: 15, opacity: 0.88, lineHeight: 1.5 }}>
                Редактируйте любые поля профилей. Каждое изменение фиксируется в журнале аудита.
              </p>
            </div>
          </div>
        </section>
      </div>

      <div style={{ maxWidth: 1440, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "18px 22px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
              Сотрудники ({staff.length})
            </h2>
            <div
              style={{
                position: "relative",
                minWidth: 240,
                flex: "0 1 300px",
              }}
            >
              <Search
                size={16}
                color="var(--text-muted)"
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по имени, email, должности…"
                style={{ ...inputStyle, paddingLeft: 36 }}
              />
            </div>
          </div>

          {deleteError ? (
            <div
              style={{
                margin: "12px 22px 0",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {deleteError}
            </div>
          ) : null}
          {inviteError ? (
            <div
              style={{
                margin: "12px 22px 0",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {inviteError}
            </div>
          ) : null}

          {filteredStaff.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
              Никто не найден.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--bg)", color: "var(--text-muted)", fontSize: 11 }}>
                    <th style={{ textAlign: "left", padding: "12px 22px", fontWeight: 700, letterSpacing: "0.05em" }}>СОТРУДНИК</th>
                    <th style={{ textAlign: "left", padding: "12px 14px", fontWeight: 700, letterSpacing: "0.05em" }}>РОЛЬ</th>
                    <th style={{ textAlign: "left", padding: "12px 14px", fontWeight: 700, letterSpacing: "0.05em" }}>ДОЛЖНОСТЬ</th>
                    <th style={{ textAlign: "left", padding: "12px 14px", fontWeight: 700, letterSpacing: "0.05em" }}>ОТДЕЛ</th>
                    <th style={{ textAlign: "left", padding: "12px 14px", fontWeight: 700, letterSpacing: "0.05em" }}>ПРОЖИВАНИЕ</th>
                    <th style={{ textAlign: "right", padding: "12px 22px", fontWeight: 700, letterSpacing: "0.05em" }}>ОТПУСК / БОЛЬНИЧНЫЕ</th>
                    <th style={{ width: 220 }} />
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((s) => (
                    <tr key={s.id} style={{ borderTop: "1px solid var(--border)" }}>
                      <td style={{ padding: "14px 22px", verticalAlign: "top" }}>
                        <div style={{ fontWeight: 600 }}>
                          {s.first_name}
                          {s.middle_name ? ` ${s.middle_name}` : ""} {s.last_name}
                        </div>
                        <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>
                          {s.email}
                        </div>
                      </td>
                      <td style={{ padding: "14px 14px", verticalAlign: "top" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 700,
                            background:
                              s.role === "admin"
                                ? "var(--holiday-bg)"
                                : s.role === "lead"
                                  ? "var(--primary-bg)"
                                  : "var(--bg)",
                            color:
                              s.role === "admin"
                                ? "var(--holiday)"
                                : s.role === "lead"
                                  ? "var(--primary)"
                                  : "var(--text-muted)",
                          }}
                        >
                          {roles.find((r) => r.id === s.role)?.label ?? s.role}
                        </span>
                      </td>
                      <td style={{ padding: "14px 14px", verticalAlign: "top", color: "var(--text-muted)" }}>
                        {s.title || "—"}
                      </td>
                      <td style={{ padding: "14px 14px", verticalAlign: "top", color: "var(--text-muted)" }}>
                        {s.department || "—"}
                      </td>
                      <td style={{ padding: "14px 14px", verticalAlign: "top", color: "var(--text-muted)" }}>
                        {s.country_residence || s.region || "—"}
                      </td>
                      <td style={{ padding: "14px 22px", verticalAlign: "top", textAlign: "right", whiteSpace: "nowrap" }}>
                        <span style={{ fontWeight: 600 }}>{s.vacation_used}/{s.vacation_total}</span>
                        <span style={{ color: "var(--text-muted)", margin: "0 6px" }}>·</span>
                        <span style={{ fontWeight: 600 }}>{s.sick_total}</span>
                      </td>
                      <td style={{ padding: "14px 22px", verticalAlign: "top", textAlign: "right", whiteSpace: "nowrap" }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => handleSendInvite(s)}
                          disabled={invitingId === s.id || !s.email}
                          title={!s.email ? "Нет email" : "Сгенерировать приглашение"}
                          style={{ padding: "6px 10px", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, marginRight: 6 }}
                        >
                          <Mail size={14} />
                          {invitingId === s.id ? "…" : "Invite"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setEditingId(s.id)}
                          style={{ padding: "6px 12px", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, marginRight: 6 }}
                        >
                          <Pencil size={14} />
                          Изменить
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(s)}
                          disabled={deletingId === s.id || s.id === viewer?.id}
                          aria-label={`Удалить ${s.first_name} ${s.last_name}`}
                          title={s.id === viewer?.id ? "Нельзя удалить свой собственный аккаунт" : "Удалить"}
                          style={{
                            padding: 7,
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-sm)",
                            background: "var(--surface)",
                            color: "var(--text-muted)",
                            cursor: s.id === viewer?.id ? "not-allowed" : "pointer",
                            opacity: s.id === viewer?.id ? 0.4 : 1,
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                          onMouseEnter={(e) => {
                            if (s.id === viewer?.id) return;
                            e.currentTarget.style.background = "var(--danger-bg)";
                            e.currentTarget.style.color = "var(--danger)";
                            e.currentTarget.style.borderColor = "var(--danger)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "var(--surface)";
                            e.currentTarget.style.color = "var(--text-muted)";
                            e.currentTarget.style.borderColor = "var(--border)";
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <ChangeHistory staff={staff} changes={staffChanges} />
      </div>

      {editingStaff ? (
        <EditStaffModal
          key={editingStaff.id}
          staff={editingStaff}
          viewerId={viewer?.id ?? null}
          onClose={closeModal}
          onSaved={async () => {
            await refetch();
            closeModal();
          }}
        />
      ) : null}

      {invite ? (
        <InviteLinkModal
          staff={invite.staff}
          url={invite.url}
          expiresAt={invite.expiresAt}
          onClose={() => setInvite(null)}
        />
      ) : null}
    </>
  );
}

function InviteLinkModal({
  staff,
  url,
  expiresAt,
  onClose,
}: {
  staff: StaffProfile;
  url: string;
  expiresAt: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // no-op — clipboard might be denied; user can select manually
    }
  }

  const fullName = `${staff.first_name}${staff.middle_name ? " " + staff.middle_name : ""} ${staff.last_name}`.trim();
  const subject = encodeURIComponent("Приглашение в MelonStaff портал");
  const body = encodeURIComponent(
    `${fullName || "Привет"},\n\n` +
      `Для вас создан аккаунт в MelonStaff. Перейдите по ссылке и задайте пароль:\n\n${url}\n\n` +
      `Ссылка действует до ${new Date(expiresAt).toLocaleString("ru-RU")}.\n\n` +
      `Логин для будущих входов: ${staff.email}`
  );
  const mailto = `mailto:${staff.email}?subject=${subject}&body=${body}`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 130,
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
          maxWidth: 560,
          padding: 0,
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
        }}
      >
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
              Приглашение создано
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
              Для {fullName || staff.email}. Действует до{" "}
              <strong style={{ color: "var(--text)" }}>
                {new Date(expiresAt).toLocaleString("ru-RU")}
              </strong>
              .
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            aria-label="Close"
            style={{ padding: 8, minWidth: 40, borderRadius: "var(--radius-sm)" }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: "18px 22px" }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>
            Ссылка-инвайт
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                background: "var(--bg)",
                fontSize: 13,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                color: "var(--text)",
                outline: "none",
              }}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCopy}
              style={{ padding: "10px 14px", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Скопировано" : "Копировать"}
            </button>
          </div>

          <div
            style={{
              marginTop: 14,
              padding: "12px 14px",
              borderRadius: "var(--radius-sm)",
              background: "var(--gradient-subtle)",
              border: "1px dashed var(--border)",
              fontSize: 12,
              color: "var(--text-muted)",
              lineHeight: 1.5,
            }}
          >
            Пользователь получит ссылку и при переходе задаст свой пароль. Доступ откроется
            согласно его роли и правам (их можно настроить через «Изменить»).
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
            <a
              href={mailto}
              className="btn btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}
            >
              <Mail size={16} strokeWidth={2.5} />
              Открыть в почтовом клиенте
            </a>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}
            >
              <ExternalLink size={16} />
              Открыть ссылку в новой вкладке
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChangeHistory({
  staff,
  changes,
}: {
  staff: StaffProfile[];
  changes: StaffProfileChangeRow[];
}) {
  const staffMap = useMemo(
    () => new Map(staff.map((s) => [s.id, s])),
    [staff]
  );

  if (changes.length === 0) {
    return (
      <div className="card" style={{ padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <History size={16} color="var(--primary)" />
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>История изменений</h2>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
          Пока пусто. Любое сохранение правок появится здесь с указанием поля, старого и нового значений.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
        <History size={16} color="var(--primary)" />
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>История изменений</h2>
        <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em" }}>
          ПОСЛЕДНИЕ {changes.length}
        </span>
      </div>
      <div style={{ maxHeight: 460, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--bg)", color: "var(--text-muted)", fontSize: 11, position: "sticky", top: 0 }}>
              <th style={{ textAlign: "left", padding: "10px 22px", fontWeight: 700, letterSpacing: "0.04em" }}>КОГДА</th>
              <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 700, letterSpacing: "0.04em" }}>СОТРУДНИК</th>
              <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 700, letterSpacing: "0.04em" }}>КТО ИЗМЕНИЛ</th>
              <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 700, letterSpacing: "0.04em" }}>ПОЛЕ</th>
              <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 700, letterSpacing: "0.04em" }}>БЫЛО → СТАЛО</th>
            </tr>
          </thead>
          <tbody>
            {changes.map((c) => {
              const target = c.staff_id ? staffMap.get(c.staff_id) : null;
              const author = c.changed_by ? staffMap.get(c.changed_by) : null;
              return (
                <tr key={c.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 22px", verticalAlign: "top", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    {new Date(c.changed_at).toLocaleString("ru-RU")}
                  </td>
                  <td style={{ padding: "10px 14px", verticalAlign: "top" }}>
                    {target ? `${target.first_name} ${target.last_name}` : "—"}
                  </td>
                  <td style={{ padding: "10px 14px", verticalAlign: "top", color: "var(--text-muted)" }}>
                    {author ? `${author.first_name} ${author.last_name}` : "system"}
                  </td>
                  <td style={{ padding: "10px 14px", verticalAlign: "top", fontWeight: 600 }}>
                    {fieldLabel(c.field)}
                  </td>
                  <td style={{ padding: "10px 14px", verticalAlign: "top", color: "var(--text-muted)", fontSize: 12 }}>
                    <span style={{ textDecoration: "line-through", opacity: 0.7 }}>
                      {c.old_value || "—"}
                    </span>
                    <span style={{ margin: "0 8px", color: "var(--primary)" }}>→</span>
                    <span style={{ color: "var(--text)" }}>{c.new_value || "—"}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditStaffModal({
  staff,
  viewerId,
  onClose,
  onSaved,
}: {
  staff: StaffProfile;
  viewerId: string | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}) {
  const original = useMemo(() => toEditable(staff), [staff]);
  const [form, setForm] = useState<EditableProfile>(() => toEditable(staff));
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const changes = useMemo(() => diffFields(original, form), [original, form]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (changes.length === 0) {
      onClose();
      return;
    }
    if (!supabase) {
      setErr("Supabase не подключён.");
      return;
    }
    setSubmitting(true);
    setErr(null);

    const payload: Record<string, unknown> = {
      first_name: form.first_name.trim(),
      middle_name: form.middle_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim().toLowerCase(),
      title: form.title.trim(),
      role: form.role,
      region: form.region.trim(),
      employee_id: form.employee_id.trim(),
      manager_name: form.manager_name.trim(),
      joined_at: form.joined_at || null,
      vacation_used: form.vacation_used,
      vacation_total: form.vacation_total,
      sick_total: form.sick_total,
      birthday: form.birthday || null,
      country_citizenship: form.country_citizenship,
      country_residence: form.country_residence,
      country_legal: form.country_legal.trim(),
      personal_note: form.personal_note,
      department: form.department,
      permissions: form.permissions,
    };

    const { error: updErr } = await supabase
      .from("staff_profiles")
      .update(payload)
      .eq("id", staff.id);

    if (updErr) {
      setSubmitting(false);
      setErr(updErr.message);
      return;
    }

    // Insert audit rows. We swallow audit errors (non-fatal) so the UI still reflects the save.
    const auditRows = changes.map((c) => ({
      staff_id: staff.id,
      changed_by: viewerId,
      field: c.field,
      old_value: c.oldValue || null,
      new_value: c.newValue || null,
    }));
    if (auditRows.length) {
      const { error: auditErr } = await supabase.from("staff_profile_changes").insert(auditRows);
      if (auditErr) {
        // eslint-disable-next-line no-console
        console.warn("audit log insert failed:", auditErr.message);
      }
    }

    setSubmitting(false);
    await onSaved();
  }

  function setField<K extends keyof EditableProfile>(k: K, v: EditableProfile[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function togglePermission(id: PermissionId) {
    setForm((f) => {
      const has = f.permissions.includes(id);
      return {
        ...f,
        permissions: has ? f.permissions.filter((p) => p !== id) : [...f.permissions, id],
      };
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-staff-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
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
      <form
        className="card"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 720,
          maxHeight: "min(90vh, 860px)",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
        }}
      >
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h2 id="edit-staff-title" style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
              {staff.first_name}
              {staff.middle_name ? ` ${staff.middle_name}` : ""} {staff.last_name}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
              {changes.length === 0
                ? "Нет несохранённых изменений."
                : `Изменено полей: ${changes.length}`}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            aria-label="Close"
            style={{ padding: 8, minWidth: 40, borderRadius: "var(--radius-sm)" }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ overflowY: "auto", flex: 1, minHeight: 0, padding: "18px 22px" }}>
          {err ? (
            <div
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

          <Section title="Основное">
            <Grid>
              <Field label="Имя">
                <input value={form.first_name} onChange={(e) => setField("first_name", e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Фамилия">
                <input value={form.last_name} onChange={(e) => setField("last_name", e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Отчество">
                <input value={form.middle_name} onChange={(e) => setField("middle_name", e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Email">
                <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Должность">
                <input value={form.title} onChange={(e) => setField("title", e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Отдел">
                <select
                  value={form.department}
                  onChange={(e) => setField("department", e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="">— Не указан —</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Роль">
                <select
                  value={form.role}
                  onChange={(e) => setField("role", e.target.value as UserRoleId)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Employee ID">
                <input value={form.employee_id} onChange={(e) => setField("employee_id", e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Лид">
                <input value={form.manager_name} onChange={(e) => setField("manager_name", e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Дата начала работы">
                <input type="date" value={form.joined_at || ""} onChange={(e) => setField("joined_at", e.target.value)} style={inputStyle} />
              </Field>
              <Field label="День рождения">
                <input type="date" value={form.birthday || ""} onChange={(e) => setField("birthday", e.target.value)} style={inputStyle} />
              </Field>
            </Grid>
          </Section>

          <Section title="География">
            <Grid>
              <Field label="Гражданство">
                <select
                  value={form.country_citizenship}
                  onChange={(e) => setField("country_citizenship", e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="">— Не указано —</option>
                  {COUNTRIES_RU.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Страна проживания">
                <select
                  value={form.country_residence}
                  onChange={(e) => setField("country_residence", e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="">— Не указано —</option>
                  {COUNTRIES_RU.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Юрисдикция ИП / контракт">
                <input value={form.country_legal} onChange={(e) => setField("country_legal", e.target.value)} style={inputStyle} placeholder="Грузия" />
              </Field>
              <Field label="Регион (legacy)">
                <input value={form.region} onChange={(e) => setField("region", e.target.value)} style={inputStyle} />
              </Field>
            </Grid>
          </Section>

          <Section title="Балансы отсутствий">
            <Grid>
              <Field label="Использовано отпускных">
                <input
                  type="number"
                  min={0}
                  value={form.vacation_used}
                  onChange={(e) => setField("vacation_used", Math.max(0, Number(e.target.value) || 0))}
                  style={inputStyle}
                />
              </Field>
              <Field label="Отпускных всего в год">
                <input
                  type="number"
                  min={0}
                  max={365}
                  value={form.vacation_total}
                  onChange={(e) => setField("vacation_total", Math.max(0, Number(e.target.value) || 0))}
                  style={inputStyle}
                />
              </Field>
              <Field label="Больничных всего в год">
                <input
                  type="number"
                  min={0}
                  max={365}
                  value={form.sick_total}
                  onChange={(e) => setField("sick_total", Math.max(0, Number(e.target.value) || 0))}
                  style={inputStyle}
                />
              </Field>
            </Grid>
          </Section>

          <Section title="Персональный комментарий">
            <textarea
              value={form.personal_note}
              onChange={(e) => setField("personal_note", e.target.value)}
              style={{ ...inputStyle, minHeight: 90, resize: "vertical", fontFamily: "inherit" }}
            />
          </Section>

          <Section title="Права доступа">
            {permissionGroups.map((group) => (
              <div key={group.title} style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  {group.title}
                </div>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {group.items.map((item) => (
                    <li
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        padding: "8px 0",
                        borderTop: "1px solid var(--border)",
                      }}
                    >
                      <input
                        type="checkbox"
                        id={`perm-${item.id}-${staff.id}`}
                        checked={form.permissions.includes(item.id)}
                        onChange={() => togglePermission(item.id)}
                        style={{ width: 16, height: 16, marginTop: 3, cursor: "pointer" }}
                      />
                      <label htmlFor={`perm-${item.id}-${staff.id}`} style={{ cursor: "pointer", flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{item.label}</div>
                        {item.hint ? (
                          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                            {item.hint}
                          </div>
                        ) : null}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>

          {changes.length > 0 ? (
            <Section title="Что будет записано в историю">
              <ul style={{ listStyle: "none", margin: 0, padding: 0, fontSize: 12 }}>
                {changes.map((c) => (
                  <li
                    key={c.field}
                    style={{
                      display: "flex",
                      gap: 10,
                      padding: "6px 0",
                      borderTop: "1px solid var(--border)",
                      color: "var(--text-muted)",
                    }}
                  >
                    <span style={{ fontWeight: 700, color: "var(--text)", minWidth: 160 }}>
                      {fieldLabel(c.field)}
                    </span>
                    <span style={{ textDecoration: "line-through", opacity: 0.7 }}>
                      {c.oldValue || "—"}
                    </span>
                    <span style={{ color: "var(--primary)" }}>→</span>
                    <span style={{ color: "var(--text)" }}>{c.newValue || "—"}</span>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}
        </div>

        <div
          style={{
            padding: "14px 22px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Отмена
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || changes.length === 0}
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <Check size={16} strokeWidth={2.5} />
            {submitting ? "Сохранение…" : changes.length === 0 ? "Нет изменений" : `Сохранить (${changes.length})`}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}
