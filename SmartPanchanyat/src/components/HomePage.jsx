export default function HomePage({ navigate }) {
  const stats = [
    { label: "Total Funds Tracked", value: "₹15,40,000", icon: "💰" },
    { label: "Verified Projects", value: "24", icon: "✅" },
    { label: "Issues Resolved", value: "156", icon: "🤝" }
  ];

  const feed = [
    { icon: "✅", color: "#10b981", text: "Ward 4 Pipeline Approved", time: "10 mins ago" },
    { icon: "🛣️", color: "#f97316", text: "Road Repair Completed", time: "1 hour ago" },
    { icon: "💧", color: "#2563eb", text: "New Water Tank Installation Started", time: "2 hours ago" },
    { icon: "🏗️", color: "#f59e0b", text: "Overhead Tank Installation", time: "2 hours ago" }
  ];

  const projects = [
    { label: "Water", pct: 35, color: "#2563eb" },
    { label: "Roads", pct: 30, color: "#10b981" },
    { label: "Education", pct: 20, color: "#f59e0b" },
    { label: "Health", pct: 15, color: "#ef4444" }
  ];

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 32px" }}>
      {/* Hero */}
      <div style={{
        borderRadius: "20px",
        background: "linear-gradient(135deg, #1d4ed8 0%, #0891b2 50%, #059669 100%)",
        padding: "48px 40px",
        color: "#fff",
        marginBottom: "32px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.1, backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <h1 style={{ margin: "0 0 8px", fontSize: "32px", fontWeight: 800 }}>Welcome to <strong>SmartPanchayat</strong></h1>
        <p style={{ margin: 0, opacity: 0.85, fontSize: "16px" }}>Empowering Citizens through Blockchain-Powered Transparency and Trust</p>

        <div style={{ display: "flex", gap: "20px", marginTop: "32px", justifyContent: "center", flexWrap: "wrap" }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)",
              borderRadius: "16px", padding: "20px 28px", minWidth: "180px",
              border: "1px solid rgba(255,255,255,0.2)"
            }}>
              <div style={{ fontSize: "24px", marginBottom: "6px" }}>{s.icon}</div>
              <div style={{ fontSize: "24px", fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: "13px", opacity: 0.85 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "32px", flexWrap: "wrap" }}>
        <button onClick={() => navigate("raise")} style={{
          flex: 1, minWidth: "200px", padding: "20px", borderRadius: "16px",
          background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
          color: "#fff", border: "none", cursor: "pointer",
          fontSize: "16px", fontWeight: 700, fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: "12px"
        }}>
          <span style={{ fontSize: "28px" }}>📢</span>
          <div style={{ textAlign: "left" }}>
            <div>Raise New Issue</div>
            <div style={{ fontSize: "12px", opacity: 0.8, fontWeight: 400 }}>Report a civic problem</div>
          </div>
        </button>
        <button onClick={() => navigate("track")} style={{
          flex: 1, minWidth: "200px", padding: "20px", borderRadius: "16px",
          background: "#fff", color: "#111827", border: "1px solid #e5e7eb",
          cursor: "pointer", fontSize: "16px", fontWeight: 700, fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: "12px"
        }}>
          <span style={{ fontSize: "28px" }}>🔍</span>
          <div style={{ textAlign: "left" }}>
            <div>Track Issues</div>
            <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 400 }}>Monitor your complaints</div>
          </div>
        </button>
        <button onClick={() => navigate("complaints")} style={{
          flex: 1, minWidth: "200px", padding: "20px", borderRadius: "16px",
          background: "#fff", color: "#111827", border: "1px solid #e5e7eb",
          cursor: "pointer", fontSize: "16px", fontWeight: 700, fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: "12px"
        }}>
          <span style={{ fontSize: "28px" }}>📋</span>
          <div style={{ textAlign: "left" }}>
            <div>All Complaints</div>
            <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 400 }}>View all ward issues</div>
          </div>
        </button>
      </div>

      {/* Two column */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Projects */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: 700, color: "#111827" }}>Recent Projects</h2>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <div style={{ position: "relative", width: "120px", height: "120px", flexShrink: 0 }}>
              <svg viewBox="0 0 36 36" style={{ width: "120px", height: "120px", transform: "rotate(-90deg)" }}>
                {(() => {
                  let offset = 0;
                  return projects.map((p, i) => {
                    const stroke = (p.pct / 100) * 100;
                    const el = <circle key={i} cx="18" cy="18" r="15" fill="none" stroke={p.color} strokeWidth="6" strokeDasharray={`${stroke} ${100 - stroke}`} strokeDashoffset={-offset} />;
                    offset += stroke;
                    return el;
                  });
                })()}
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: "10px", color: "#6b7280", textAlign: "center", lineHeight: 1.3 }}>5-Year<br/>Spending<br/>Analysis</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {projects.map(p => (
                <div key={p.label} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: p.color }} />
                  <span style={{ fontSize: "13px", color: "#374151", flex: 1 }}>{p.label}</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{p.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Feed */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: 700, color: "#111827" }}>Live Activity Feed</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {feed.map((f, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "12px", borderRadius: "12px", background: "#f9fafb"
              }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: `${f.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{f.text}</div>
                  <div style={{ fontSize: "11px", color: "#9ca3af" }}>{f.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}