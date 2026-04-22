import { LayoutDashboard, Calendar, User, Settings, Shield } from "lucide-react";
import { MelonStaffMark } from "./MelonStaffMark";

export type SidebarRoute = "dashboard" | "calendar" | "profile" | "settings" | "admin";

const nav = [
  { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { id: "calendar" as const, label: "Calendar", icon: Calendar },
  { id: "profile" as const, label: "Profile", icon: User },
  { id: "settings" as const, label: "Settings", icon: Settings },
  { id: "admin" as const, label: "Admin", icon: Shield },
];

export function Sidebar({
  active,
  onNavigate,
}: {
  active: SidebarRoute;
  onNavigate: (route: SidebarRoute) => void;
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
          <MelonStaffMark size={44} />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "17px",
                fontWeight: 800,
                color: "var(--primary)",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
              }}
            >
              MelonStaff
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
                onNavigate(item.id);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 14px",
                marginBottom: 4,
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
                color: isActive ? "var(--primary)" : "var(--text-muted)",
                fontWeight: isActive ? 600 : 500,
                fontSize: 14,
                background: isActive ? "var(--holiday-bg)" : "transparent",
                borderLeft: isActive ? "3px solid var(--holiday)" : "3px solid transparent",
                marginLeft: isActive ? 0 : 3,
                paddingLeft: isActive ? 11 : 14,
                cursor: "pointer",
                opacity: 1,
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2.25 : 2} />
              {item.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
