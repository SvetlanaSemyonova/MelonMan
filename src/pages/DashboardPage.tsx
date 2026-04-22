import { Download, Plus, Sparkles } from "lucide-react";
import { MetricCards } from "../components/MetricCards";
import { TodaysAbsences } from "../components/TodaysAbsences";
import { PresenceInsights } from "../components/PresenceInsights";
import { TeamSchedule } from "../components/TeamSchedule";
import { QuickRequest } from "../components/QuickRequest";
import { RightSidebar } from "../components/RightSidebar";
import { usePortalData } from "../context/PortalDataContext";

function greeting(hour: number): string {
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardPage() {
  const { viewer, metrics } = usePortalData();
  const firstName = viewer?.first_name ?? "there";
  const hello = greeting(new Date().getHours());
  const totalOut = metrics.onHoliday + metrics.sickLeave + metrics.oooRemote;
  const dateLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <>
      <div style={{ maxWidth: 1440, margin: "0 auto 24px" }}>
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
                <Sparkles size={13} />
                {dateLabel}
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
                {hello}, {firstName} 👋
              </h1>
              <p style={{ margin: 0, fontSize: 15, opacity: 0.88, lineHeight: 1.5 }}>
                {totalOut === 0
                  ? "Everyone's in today — a full team, full momentum."
                  : `${totalOut} ${totalOut === 1 ? "person is" : "people are"} out today. Here's your team at a glance.`}
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
              <button type="button" className="btn btn-hero-secondary">
                <Download size={16} />
                Download Report
              </button>
              <button type="button" className="btn btn-hero-primary">
                <Plus size={16} />
                Log Absence
              </button>
            </div>
          </div>
        </section>
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
