import {
  LayoutDashboard,
  Calendar,
  User,
  Settings,
  Shield,
  Building2,
} from "lucide-react";
import { MelonManMark } from "./MelonManMark";

export type SidebarRoute = "dashboard" | "calendar" | "profile" | "admin";

const nav = [
  { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { id: "calendar" as const, label: "Calendar", icon: Calendar },
  { id: "profile" as const, label: "Profile", icon: User },
  { id: "settings" as const, label: "Settings", icon: Settings, disabled: true },
  { id: "admin" as const, label: "Admin", icon: Shield },
];

export function Sidebar({
  active,
  onNavigate,
  orgName,
  planName,
}: {
  active: SidebarRoute;
  onNavigate: (route: SidebarRoute) => void;
  orgName: string;
  planName: string;
}) {
  return (
    <aside
      style={{
        width: "var(--sidebar-width)",
        flexShrink: 0,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <div style={{ padding: "24px 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <MelonManMark size={44} />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "17px",
                fontWeight: 800,
                color: "var(--navy)",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
              }}
            >
              MelonMan
            </div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                marginTop: 3,
              }}
            >
              Management Suite
            </div>
          </div>
        </div>
      </div>

      <nav style={{ padding: "0 12px", flex: 1 }}>
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === active;
          return (
            <a
              key={item.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (item.disabled) return;
                if (
                  item.id === "dashboard" ||
                  item.id === "calendar" ||
                  item.id === "profile" ||
                  item.id === "admin"
                ) {
                  onNavigate(item.id);
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 14px",
                marginBottom: 4,
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
                color: isActive ? "var(--navy)" : "var(--text-muted)",
                fontWeight: isActive ? 600 : 500,
                fontSize: 14,
                background: isActive ? "var(--holiday-bg)" : "transparent",
                borderLeft: isActive ? "3px solid var(--holiday)" : "3px solid transparent",
                marginLeft: isActive ? 0 : 3,
                paddingLeft: isActive ? 11 : 14,
                cursor: item.disabled ? "default" : "pointer",
                opacity: item.disabled ? 0.45 : 1,
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2.25 : 2} />
              {item.label}
            </a>
          );
        })}
      </nav>

      <div style={{ padding: 16 }}>
        <div
          className="card"
          style={{
            padding: 14,
            boxShadow: "var(--shadow)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "var(--bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Building2 size={18} color="var(--navy)" />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{orgName}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{planName}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
