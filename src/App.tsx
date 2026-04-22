import { useState } from "react";
import { Sidebar, type SidebarRoute } from "./components/Sidebar";
import { Header } from "./components/Header";
import { DashboardPage } from "./pages/DashboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { CalendarPage } from "./pages/CalendarPage";
import { AdminPage } from "./pages/AdminPage";
import { BackgroundShader } from "./components/BackgroundShader";
import { usePortalData } from "./context/PortalDataContext";

function roleLabel(role: string | undefined): string | undefined {
  if (role === "admin") return "Administrator";
  if (role === "lead") return "Team Lead";
  if (role === "employee") return "Employee";
  return role;
}

export default function App() {
  const [route, setRoute] = useState<SidebarRoute>("dashboard");
  const { viewer, error, loading } = usePortalData();

  const sidebarFooter =
    route === "profile"
      ? { orgName: "Presence Org", planName: "Enterprise Plan" }
      : route === "calendar"
        ? { orgName: "Architecture Global", planName: "Enterprise Plan" }
        : { orgName: "Acme Global", planName: "Premium Account" };

  const searchPlaceholder =
    route === "profile"
      ? "Search platform..."
      : route === "calendar"
        ? "Search team members or events..."
        : route === "admin"
          ? "Search users, roles..."
          : "Search team or events...";

  const viewerName = viewer ? `${viewer.first_name} ${viewer.last_name}` : "—";
  const viewerInitials = viewer
    ? `${viewer.first_name[0] ?? ""}${viewer.last_name[0] ?? ""}`.toUpperCase()
    : "—";

  const userRole =
    route === "profile"
      ? undefined
      : route === "admin"
        ? roleLabel(viewer?.role) ?? "Administrator"
        : roleLabel(viewer?.role) ?? "HR Director";

  return (
    <div className="app-shell">
      <Sidebar
        active={route}
        onNavigate={setRoute}
        orgName={sidebarFooter.orgName}
        planName={sidebarFooter.planName}
      />
      <div className="main-wrap">
        {error ? (
          <div
            style={{
              padding: "10px 28px",
              background: "#fef3c7",
              color: "#92400e",
              fontSize: 13,
              fontWeight: 600,
              borderBottom: "1px solid #fcd34d",
            }}
          >
            {error}{" "}
            {loading
              ? ""
              : "Миграция нужна только для таблиц в облаке; для браузера обязателен .env с ключами API."}
          </div>
        ) : null}
        <Header
          searchPlaceholder={searchPlaceholder}
          userName={viewerName}
          userInitials={viewerInitials}
          userRole={userRole}
          showStatusDot={route === "calendar"}
        />
        <div className="content-scroll">
          <div style={{ position: "relative", minHeight: "100%" }}>
            <BackgroundShader />
            <div style={{ position: "relative", zIndex: 1 }}>
              {route === "dashboard" ? (
                <DashboardPage />
              ) : route === "calendar" ? (
                <CalendarPage />
              ) : route === "profile" ? (
                <ProfilePage />
              ) : (
                <AdminPage />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
