import { useState } from "react";
import { Sidebar, type SidebarRoute } from "./components/Sidebar";
import { Header } from "./components/Header";
import { DashboardPage } from "./pages/DashboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { CalendarPage } from "./pages/CalendarPage";
import { AdminPage } from "./pages/AdminPage";
import { SettingsPage } from "./pages/SettingsPage";
import { LoginPage } from "./pages/LoginPage";
import { ChangePasswordPage } from "./pages/ChangePasswordPage";
import { InviteAcceptPage } from "./pages/InviteAcceptPage";
import { BackgroundShader } from "./components/BackgroundShader";
import { usePortalData } from "./context/PortalDataContext";
import { useAuth } from "./context/AuthContext";

function roleLabel(role: string | undefined): string | undefined {
  if (role === "admin") return "Administrator";
  if (role === "lead") return "Team Lead";
  if (role === "employee") return "Employee";
  return role;
}

export default function App() {
  const [route, setRoute] = useState<SidebarRoute>("dashboard");
  const { viewer, error, loading } = usePortalData();
  const { authStaffId, authReady } = useAuth();

  if (!authReady) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          fontSize: 14,
        }}
      >
        Загружаем сессию…
      </div>
    );
  }

  const inviteToken =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("invite")
      : null;
  if (inviteToken) {
    return <InviteAcceptPage token={inviteToken} />;
  }

  if (!authStaffId) {
    return <LoginPage />;
  }

  if (viewer?.must_change_password) {
    return <ChangePasswordPage />;
  }

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
      <Sidebar active={route} onNavigate={setRoute} />
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
              ) : route === "settings" ? (
                <SettingsPage />
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
