import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { UserPlus, Shield, Check } from "lucide-react";
import {
  roles,
  permissionGroups,
  buildPermissionMap,
  type UserRoleId,
  type PermissionId,
} from "../data/adminMock";

type AddedUser = {
  id: string;
  name: string;
  email: string;
  title: string;
  role: UserRoleId;
  permissions: PermissionId[];
  createdAt: string;
};

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

export function AdminPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [role, setRole] = useState<UserRoleId>("employee");
  const [permissions, setPermissions] = useState(() => buildPermissionMap("employee"));
  const [users, setUsers] = useState<AddedUser[]>([]);
  const [savedFlash, setSavedFlash] = useState(false);

  const roleMeta = useMemo(() => roles.find((r) => r.id === role), [role]);

  function applyRoleTemplate(nextRole: UserRoleId) {
    setRole(nextRole);
    setPermissions(buildPermissionMap(nextRole));
  }

  function togglePermission(id: PermissionId) {
    setPermissions((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return;

    const enabled = (Object.entries(permissions) as [PermissionId, boolean][])
      .filter(([, v]) => v)
      .map(([k]) => k);

    const entry: AddedUser = {
      id: `u-${Date.now()}`,
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim(),
      title: title.trim() || "—",
      role,
      permissions: enabled,
      createdAt: new Date().toLocaleString("ru-RU"),
    };
    setUsers((prev) => [entry, ...prev]);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2800);
    setFirstName("");
    setLastName("");
    setEmail("");
    setTitle("");
    applyRoleTemplate("employee");
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 700, color: "var(--navy)" }}>
          Администрирование
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>
          Добавление пользователей, назначение роли и индивидуальных прав доступа (данные только в этой
          сессии).
        </p>
      </div>

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
          Пользователь добавлен в список ниже (демо, без сохранения на сервер).
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
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Должность</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
              placeholder="Например, Senior Developer"
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
            <Shield size={18} color="var(--navy)" />
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
          <button type="submit" className="btn btn-primary" style={{ padding: "12px 24px" }}>
            Добавить пользователя
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
          Недавно добавленные ({users.length})
        </div>
        {users.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
            Пока никого не добавляли — записи появятся здесь после отправки формы.
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
                {users.map((u) => (
                  <tr key={u.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "14px 18px", verticalAlign: "top" }}>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{u.email}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{u.title}</div>
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
                      {u.permissions.length
                        ? u.permissions
                            .map((id) => permissionGroups.flatMap((g) => g.items).find((i) => i.id === id)?.label)
                            .filter(Boolean)
                            .join(" · ")
                        : "—"}
                    </td>
                    <td style={{ padding: "14px 18px", verticalAlign: "top", whiteSpace: "nowrap" }}>
                      {u.createdAt}
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
