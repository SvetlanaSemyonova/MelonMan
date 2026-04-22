import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { UserPlus, Shield, Check, Settings, Calendar, Trash2 } from "lucide-react";
import { usePortalData } from "../context/PortalDataContext";
import {
  roles,
  permissionGroups,
  buildPermissionMap,
  type UserRoleId,
  type PermissionId,
} from "../data/adminMock";
import { COUNTRIES_RU } from "../data/countriesRu";
import { DEPARTMENTS } from "../data/departments";
import { supabase } from "../lib/supabaseClient";

const HOLIDAY_COUNTRIES = [
  "Global",
  "Польша",
  "Беларусь",
  "Россия",
  "Кипр",
  "Сербия",
  "Болгария",
];

const HOLIDAY_COUNTRY_FLAG: Record<string, string> = {
  Global: "🌍",
  "Польша": "🇵🇱",
  "Беларусь": "🇧🇾",
  "Россия": "🇷🇺",
  "Кипр": "🇨🇾",
  "Сербия": "🇷🇸",
  "Болгария": "🇧🇬",
};

const MONTHS_RU = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

function randomHolidayId(): string {
  return `custom-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border)",
  fontSize: 14,
  outline: "none",
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--text-muted)",
  marginBottom: 6,
};

function HolidaysSection() {
  const { nationalHolidays, refetch } = usePortalData();
  const [hName, setHName] = useState("");
  const [hCountry, setHCountry] = useState<string>(HOLIDAY_COUNTRIES[1]);
  const [hMonth, setHMonth] = useState(0);
  const [hDay, setHDay] = useState(1);
  const [hError, setHError] = useState<string | null>(null);
  const [hFlash, setHFlash] = useState(false);
  const [hBusy, setHBusy] = useState(false);

  const sortedHolidays = useMemo(
    () =>
      [...nationalHolidays].sort((a, b) => {
        if (a.country !== b.country) return a.country.localeCompare(b.country, "ru");
        if (a.month !== b.month) return a.month - b.month;
        return a.day - b.day;
      }),
    [nationalHolidays]
  );

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!hName.trim()) return;
    if (!supabase) {
      setHError("Supabase не подключён.");
      return;
    }
    setHBusy(true);
    setHError(null);
    const { error } = await supabase.from("national_holidays").insert({
      id: randomHolidayId(),
      month: hMonth,
      day: hDay,
      name: hName.trim(),
      country: hCountry,
    });
    setHBusy(false);
    if (error) {
      setHError(error.message);
      return;
    }
    setHName("");
    await refetch();
    setHFlash(true);
    setTimeout(() => setHFlash(false), 2400);
  }

  async function handleDelete(id: string) {
    if (!supabase) return;
    setHError(null);
    const { error } = await supabase.from("national_holidays").delete().eq("id", id);
    if (error) {
      setHError(error.message);
      return;
    }
    await refetch();
  }

  return (
    <div className="card" style={{ padding: 28, marginTop: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "var(--primary-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Calendar size={22} color="var(--primary)" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Национальные праздники</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
            Добавляйте фиксированные даты. Плавающие (Пасха и пр.) считаются автоматически в коде.
          </p>
        </div>
      </div>

      {hError ? (
        <div
          style={{
            marginBottom: 16,
            padding: "10px 14px",
            borderRadius: "var(--radius-sm)",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            fontSize: 13,
            fontWeight: 600,
            color: "#b91c1c",
          }}
        >
          {hError}
        </div>
      ) : null}
      {hFlash ? (
        <div
          style={{
            marginBottom: 16,
            padding: "10px 14px",
            borderRadius: "var(--radius-sm)",
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            fontWeight: 600,
            color: "#047857",
          }}
        >
          <Check size={16} strokeWidth={2.5} />
          Праздник добавлен.
        </div>
      ) : null}

      <form
        onSubmit={handleAdd}
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 2fr 1fr 0.8fr auto",
          gap: 10,
          alignItems: "end",
          marginBottom: 24,
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
            Страна
          </label>
          <select
            value={hCountry}
            onChange={(e) => setHCountry(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer", background: "var(--surface)" }}
          >
            {HOLIDAY_COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {HOLIDAY_COUNTRY_FLAG[c] ?? ""} {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
            Название
          </label>
          <input
            value={hName}
            onChange={(e) => setHName(e.target.value)}
            style={inputStyle}
            placeholder="Например, День Конституции"
            required
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
            Месяц
          </label>
          <select
            value={hMonth}
            onChange={(e) => setHMonth(Number(e.target.value))}
            style={{ ...inputStyle, cursor: "pointer", background: "var(--surface)" }}
          >
            {MONTHS_RU.map((m, i) => (
              <option key={m} value={i}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
            День
          </label>
          <input
            type="number"
            min={1}
            max={31}
            value={hDay}
            onChange={(e) => setHDay(Math.max(1, Math.min(31, Number(e.target.value) || 1)))}
            style={inputStyle}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={hBusy}
          style={{ height: 42, padding: "0 18px" }}
        >
          {hBusy ? "…" : "Добавить"}
        </button>
      </form>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: 10 }}>
          ВСЕГО В БАЗЕ: {sortedHolidays.length}
        </div>
        {sortedHolidays.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
            Нет праздников. Запусти миграцию 004 или добавь вручную.
          </div>
        ) : (
          <div style={{ maxHeight: 420, overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--bg)", color: "var(--text-muted)", fontSize: 11 }}>
                  <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700, letterSpacing: "0.04em" }}>СТРАНА</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700, letterSpacing: "0.04em" }}>ДАТА</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700, letterSpacing: "0.04em" }}>НАЗВАНИЕ</th>
                  <th style={{ width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {sortedHolidays.map((h) => (
                  <tr key={h.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                      <span style={{ marginRight: 6 }}>{HOLIDAY_COUNTRY_FLAG[h.country] ?? ""}</span>
                      <span style={{ fontWeight: 500 }}>{h.country}</span>
                    </td>
                    <td style={{ padding: "10px 12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {MONTHS_RU[h.month] ?? "?"} {h.day}
                    </td>
                    <td style={{ padding: "10px 12px", fontWeight: 500 }}>{h.name}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => handleDelete(h.id)}
                        aria-label={`Удалить ${h.name}`}
                        title="Удалить"
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          padding: 6,
                          borderRadius: 6,
                          display: "inline-flex",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--danger-bg)";
                          e.currentTarget.style.color = "var(--danger)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "none";
                          e.currentTarget.style.color = "var(--text-muted)";
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function permissionLabels(ids: string[]): string {
  const flat = permissionGroups.flatMap((g) => g.items);
  return ids.map((id) => flat.find((i) => i.id === id)?.label).filter(Boolean).join(" · ");
}

export function AdminPage() {
  const { staff, refetch } = usePortalData();
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [birthday, setBirthday] = useState("");
  const [joinedAt, setJoinedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [countryCitizenship, setCountryCitizenship] = useState("");
  const [countryResidence, setCountryResidence] = useState("");
  const [countryLegal, setCountryLegal] = useState("");
  const [leadName, setLeadName] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  const [vacationTotal, setVacationTotal] = useState(20);
  const [sickTotal, setSickTotal] = useState(10);
  const [department, setDepartment] = useState<string>(DEPARTMENTS[0]);
  const [role, setRole] = useState<UserRoleId>("employee");
  const [permissions, setPermissions] = useState(() => buildPermissionMap("employee"));
  const [savedFlash, setSavedFlash] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const leadOptions = useMemo(
    () =>
      staff
        .filter((s) => s.role === "lead" || s.role === "admin")
        .map((s) => `${s.first_name} ${s.last_name}`.trim()),
    [staff]
  );

  const sortedStaff = useMemo(
    () =>
      [...staff].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    [staff]
  );

  const roleMeta = useMemo(() => roles.find((r) => r.id === role), [role]);

  function applyRoleTemplate(nextRole: UserRoleId) {
    setRole(nextRole);
    setPermissions(buildPermissionMap(nextRole));
  }

  function togglePermission(id: PermissionId) {
    setPermissions((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return;
    if (!supabase) {
      setSubmitError(
        "Укажите VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в .env и перезапустите dev-сервер."
      );
      return;
    }

    const enabled = (Object.entries(permissions) as [PermissionId, boolean][])
      .filter(([, v]) => v)
      .map(([k]) => k);

    setSubmitting(true);
    setSubmitError(null);
    try {
      const normalisedEmail = email.trim().toLowerCase();
      const { error } = await supabase.from("staff_profiles").insert({
        email: normalisedEmail,
        login: normalisedEmail,
        password: "melon_user",
        must_change_password: true,
        first_name: firstName.trim(),
        middle_name: middleName.trim(),
        last_name: lastName.trim(),
        title: title.trim(),
        role,
        permissions: enabled,
        region: countryResidence.trim(),
        employee_id: "",
        manager_name: leadName.trim(),
        joined_at: joinedAt.trim() || new Date().toISOString().slice(0, 10),
        vacation_used: 0,
        vacation_total: vacationTotal,
        sick_total: sickTotal,
        birthday: birthday.trim() || null,
        country_citizenship: countryCitizenship.trim(),
        country_residence: countryResidence.trim(),
        country_legal: countryLegal.trim(),
        personal_note: personalNote.trim(),
        department,
      });
      if (error) throw error;
      await refetch();
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2800);
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setEmail("");
      setTitle("");
      setBirthday("");
      setJoinedAt(new Date().toISOString().slice(0, 10));
      setCountryCitizenship("");
      setCountryResidence("");
      setCountryLegal("");
      setLeadName("");
      setPersonalNote("");
      setVacationTotal(20);
      setSickTotal(10);
      setDepartment(DEPARTMENTS[0]);
      applyRoleTemplate("employee");
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
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
              <Settings size={13} />
              Admin
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
              Администрирование
            </h1>
            <p style={{ margin: 0, fontSize: 15, opacity: 0.88, lineHeight: 1.5 }}>
              Добавление сотрудников в таблицу <code style={{ background: "rgba(255,255,255,0.18)", padding: "1px 6px", borderRadius: 4 }}>staff_profiles</code> в Supabase: роль и права сохраняются в базе.
            </p>
          </div>
        </div>
      </section>

      {submitError ? (
        <div
          className="card"
          style={{
            marginBottom: 20,
            padding: "12px 16px",
            background: "#fef2f2",
            borderColor: "#fecaca",
            fontSize: 14,
            fontWeight: 600,
            color: "#b91c1c",
          }}
        >
          {submitError}
        </div>
      ) : null}

      {savedFlash ? (
        <div
          className="card"
          style={{
            marginBottom: 20,
            padding: "12px 16px",
            background: "#ecfdf5",
            borderColor: "#a7f3d0",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 14,
            fontWeight: 600,
            color: "#047857",
          }}
        >
          <Check size={18} strokeWidth={2.5} />
          Пользователь сохранён в Supabase.
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="card" style={{ padding: 28, marginBottom: 28 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "var(--holiday-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserPlus size={22} color="var(--holiday)" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Новый пользователь</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
              Заполните профиль, выберите роль и при необходимости скорректируйте права.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div>
            <label style={labelStyle}>Имя *</label>
            <input
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={inputStyle}
              placeholder="Иван"
            />
          </div>
          <div>
            <label style={labelStyle}>Фамилия *</label>
            <input
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={inputStyle}
              placeholder="Иванов"
            />
          </div>
          <div>
            <label style={labelStyle}>Отчество</label>
            <input
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              style={inputStyle}
              placeholder="Иванович"
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Рабочий email *</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="ivan@company.com"
            />
          </div>
          <div>
            <label style={labelStyle}>Должность</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
              placeholder="Например, Senior Developer"
            />
          </div>
          <div>
            <label style={labelStyle}>Отдел *</label>
            <select
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer", background: "var(--surface)" }}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>День рождения</label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Дата начала работы *</label>
            <input
              type="date"
              required
              value={joinedAt}
              onChange={(e) => setJoinedAt(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Гражданство</label>
            <select
              value={countryCitizenship}
              onChange={(e) => setCountryCitizenship(e.target.value)}
              style={{ ...inputStyle, background: "var(--surface)", cursor: "pointer" }}
            >
              <option value="">— Не указано —</option>
              {COUNTRIES_RU.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Страна проживания</label>
            <select
              value={countryResidence}
              onChange={(e) => setCountryResidence(e.target.value)}
              style={{ ...inputStyle, background: "var(--surface)", cursor: "pointer" }}
            >
              <option value="">— Не указано —</option>
              {COUNTRIES_RU.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Юрисдикция ИП / контракт</label>
            <input
              value={countryLegal}
              onChange={(e) => setCountryLegal(e.target.value)}
              style={inputStyle}
              placeholder="Грузия"
            />
          </div>
          <div>
            <label style={labelStyle}>Лид</label>
            <input
              list="lead-options"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              style={inputStyle}
              placeholder={leadOptions.length ? leadOptions[0] : "Имя и фамилия"}
            />
            <datalist id="lead-options">
              {leadOptions.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
          <div>
            <label style={labelStyle}>Дней отпуска в год *</label>
            <input
              type="number"
              min={0}
              max={365}
              required
              value={vacationTotal}
              onChange={(e) => setVacationTotal(Math.max(0, Math.min(365, Number(e.target.value) || 0)))}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Дней больничного в год *</label>
            <input
              type="number"
              min={0}
              max={365}
              required
              value={sickTotal}
              onChange={(e) => setSickTotal(Math.max(0, Math.min(365, Number(e.target.value) || 0)))}
              style={inputStyle}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Персональный комментарий</label>
            <textarea
              value={personalNote}
              onChange={(e) => setPersonalNote(e.target.value)}
              style={{ ...inputStyle, minHeight: 80, resize: "vertical", fontFamily: "inherit" }}
              placeholder="Внутренние заметки HR: контекст, договорённости, доп. условия…"
            />
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <label style={{ ...labelStyle, marginBottom: 10 }}>Роль *</label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => applyRoleTemplate(r.id)}
                style={{
                  textAlign: "left",
                  padding: 14,
                  borderRadius: "var(--radius-sm)",
                  border:
                    role === r.id ? "2px solid var(--holiday)" : "1px solid var(--border)",
                  background: role === r.id ? "var(--holiday-bg)" : "var(--surface)",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{r.label}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.45 }}>
                  {r.description}
                </div>
              </button>
            ))}
          </div>
          {roleMeta ? (
            <p style={{ margin: "12px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
              Шаблон прав для роли «{roleMeta.label}» применён; отдельные пункты можно изменить вручную.
            </p>
          ) : null}
        </div>

        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 22,
            marginBottom: 22,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Shield size={18} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Права доступа</h3>
          </div>
          {permissionGroups.map((group) => (
            <div key={group.title} style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  marginBottom: 10,
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
                      gap: 12,
                      padding: "10px 0",
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    <input
                      type="checkbox"
                      id={item.id}
                      checked={permissions[item.id]}
                      onChange={() => togglePermission(item.id)}
                      style={{ width: 18, height: 18, marginTop: 2, cursor: "pointer" }}
                    />
                    <label htmlFor={item.id} style={{ cursor: "pointer", flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</div>
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
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: "12px 24px" }}
            disabled={submitting}
          >
            {submitting ? "Сохранение…" : "Добавить пользователя"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => applyRoleTemplate(role)}
          >
            Сбросить права к шаблону роли
          </button>
        </div>
      </form>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid var(--border)",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          Сотрудники в базе ({sortedStaff.length})
        </div>
        {sortedStaff.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
            Пока нет записей — выполните SQL из <code>supabase/migrations/001_portal.sql</code> или добавьте
            пользователя формой выше.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--bg)", color: "var(--text-muted)", fontSize: 11 }}>
                  <th style={{ textAlign: "left", padding: "12px 18px" }}>ПОЛЬЗОВАТЕЛЬ</th>
                  <th style={{ textAlign: "left", padding: "12px 14px" }}>РОЛЬ</th>
                  <th style={{ textAlign: "left", padding: "12px 18px" }}>ПРАВА</th>
                  <th style={{ textAlign: "left", padding: "12px 18px" }}>СОЗДАН</th>
                </tr>
              </thead>
              <tbody>
                {sortedStaff.map((u) => (
                  <tr key={u.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "14px 18px", verticalAlign: "top" }}>
                      <div style={{ fontWeight: 600 }}>
                        {u.first_name}
                        {u.middle_name ? ` ${u.middle_name}` : ""} {u.last_name}
                      </div>
                      <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{u.email}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{u.title || "—"}</div>
                    </td>
                    <td style={{ padding: "14px 14px", verticalAlign: "top" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 700,
                          background: "var(--holiday-bg)",
                          color: "var(--holiday)",
                        }}
                      >
                        {roles.find((r) => r.id === u.role)?.label ?? u.role}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "14px 18px",
                        verticalAlign: "top",
                        color: "var(--text-muted)",
                        maxWidth: 320,
                      }}
                    >
                      {u.permissions?.length ? permissionLabels(u.permissions) : "—"}
                    </td>
                    <td style={{ padding: "14px 18px", verticalAlign: "top", whiteSpace: "nowrap" }}>
                      {new Date(u.created_at).toLocaleString("ru-RU")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <HolidaysSection />
    </div>
  );
}
