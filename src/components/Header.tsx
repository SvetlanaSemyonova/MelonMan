import { Search, Bell, HelpCircle, ChevronDown } from "lucide-react";

export function Header({
  searchPlaceholder,
  userName,
  userRole,
  userInitials,
  showStatusDot,
}: {
  searchPlaceholder: string;
  userName: string;
  userRole?: string;
  userInitials: string;
  showStatusDot?: boolean;
}) {
  return (
    <header
      style={{
        height: 64,
        flexShrink: 0,
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 28px",
        gap: 24,
      }}
    >
      <div
        style={{
          flex: 1,
          maxWidth: 480,
          position: "relative",
        }}
      >
        <Search
          size={18}
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
          }}
        />
        <input
          type="search"
          placeholder={searchPlaceholder}
          readOnly
          style={{
            width: "100%",
            padding: "10px 14px 10px 44px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            background: "var(--bg)",
            outline: "none",
            fontSize: 14,
          }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ padding: 10, border: "none", background: "transparent" }}
          aria-label="Notifications"
        >
          <Bell size={20} color="var(--text-muted)" />
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ padding: 10, border: "none", background: "transparent" }}
          aria-label="Help"
        >
          <HelpCircle size={20} color="var(--text-muted)" />
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 10px 6px 6px",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            marginLeft: 8,
          }}
        >
          <div style={{ position: "relative" }}>
            <div className="avatar" style={{ width: 36, height: 36, fontSize: 12 }}>
              {userInitials}
            </div>
            {showStatusDot ? (
              <span
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#22c55e",
                  border: "2px solid var(--surface)",
                }}
              />
            ) : null}
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.2 }}>{userName}</div>
            {userRole ? (
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{userRole}</div>
            ) : null}
          </div>
          <ChevronDown size={16} color="var(--text-muted)" />
        </div>
      </div>
    </header>
  );
}
