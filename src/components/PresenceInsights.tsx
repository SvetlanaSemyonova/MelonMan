export function PresenceInsights() {
  const bars = [40, 55, 48, 62, 58, 72, 68, 75, 70, 84, 78, 82];

  return (
    <div className="card" style={{ padding: "22px 24px", marginBottom: 24 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 32,
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 700 }}>Presence Insights</h2>
          <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55 }}>
            Team availability is stable this quarter. There is a <strong>15% increase</strong> in remote
            work requests compared to last month.
          </p>
          <div style={{ display: "flex", gap: 28 }}>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: "var(--navy)" }}>84%</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>Efficiency</div>
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: "var(--navy)" }}>1.2d</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>Avg Absence</div>
            </div>
          </div>
        </div>
        <div
          style={{
            height: 160,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 6,
            padding: "12px 8px 0",
            background: "linear-gradient(180deg, #f8fafc 0%, #fff 100%)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
          }}
        >
          {bars.map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${h}%`,
                minHeight: 24,
                background: `linear-gradient(180deg, ${i > 8 ? "#3b82f6" : "#93c5fd"} 0%, #bfdbfe 100%)`,
                borderRadius: 4,
                opacity: 0.85 + i * 0.01,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
