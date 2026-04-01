import { MetricCards } from "../components/MetricCards";
import { TodaysAbsences } from "../components/TodaysAbsences";
import { PresenceInsights } from "../components/PresenceInsights";
import { TeamSchedule } from "../components/TeamSchedule";
import { QuickRequest } from "../components/QuickRequest";
import { RightSidebar } from "../components/RightSidebar";

export function DashboardPage() {
  return (
    <>
      <div style={{ maxWidth: 1440, margin: "0 auto 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 700, color: "var(--text)" }}>
              Team Presence
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>
              Real-time overview of your organization&apos;s availability.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <button type="button" className="btn btn-secondary">
              Download Report
            </button>
            <button type="button" className="btn btn-primary">
              Log Absence
            </button>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div>
          <MetricCards />
          <TodaysAbsences />
          <PresenceInsights />
          <TeamSchedule />
          <QuickRequest />
        </div>
        <RightSidebar />
      </div>
    </>
  );
}
