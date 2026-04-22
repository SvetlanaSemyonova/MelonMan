import { useEffect, useRef, useState } from "react";
import { Search, Bell, HelpCircle, ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

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
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

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
        <div ref={menuRef} style={{ position: "relative", marginLeft: 8 }}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 10px 6px 6px",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              background: menuOpen ? "var(--primary-bg)" : "transparent",
              border: "none",
              color: "inherit",
              font: "inherit",
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
            <ChevronDown
              size={16}
              color="var(--text-muted)"
              style={{
                transform: menuOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.15s",
              }}
            />
          </button>

          {menuOpen ? (
            <div
              role="menu"
              className="card"
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                zIndex: 30,
                minWidth: 220,
                padding: 8,
                boxShadow: "0 20px 48px -16px rgba(15, 23, 42, 0.3)",
              }}
            >
              <div
                style={{
                  padding: "8px 10px 12px",
                  borderBottom: "1px solid var(--border)",
                  marginBottom: 6,
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13 }}>{userName}</div>
                {userRole ? (
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    {userRole}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  signOut();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: "transparent",
                  textAlign: "left",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--danger)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--danger-bg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <LogOut size={16} />
                Log Out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
