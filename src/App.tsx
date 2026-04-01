import { useState } from "react";
import { Sidebar, type SidebarRoute } from "./components/Sidebar";
import { Header } from "./components/Header";
import { DashboardPage } from "./pages/DashboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { CalendarPage } from "./pages/CalendarPage";
import { AdminPage } from "./pages/AdminPage";

export default function App() {
  const [route, setRoute] = useState<SidebarRoute>("dashboard");

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

  const userRole =
    route === "profile"
      ? undefined
      : route === "admin"
        ? "Administrator"
        : "HR Director";

  return (
    <div className="app-shell">
      <Sidebar
        active={route}
        onNavigate={setRoute}
        orgName={sidebarFooter.orgName}
        planName={sidebarFooter.planName}
      />
      <div className="main-wrap">
        <Header
          searchPlaceholder={searchPlaceholder}
          userName={route === "profile" ? "Aleksandar Nikolić" : "Alex Mercer"}
          userInitials={route === "profile" ? "AN" : "AM"}
          userRole={userRole}
          showStatusDot={route === "calendar"}
        />
        <div className="content-scroll">
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
  );
}
