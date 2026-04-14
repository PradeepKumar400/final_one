import { useState, useEffect } from "react";
import { listComplaints, mapComplaint } from "../utils/api";
import { complaints as mockComplaints, statusConfig } from "../data/complaints";
import ComplaintCard from "../components/ComplaintCard";

const STATUS_TABS = [
  { label: "All",         value: "ALL" },
  { label: "Pending",     value: "PENDING_REVIEW" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Resolved",    value: "RESOLVED" }
];

export default function ComplaintsPage({ navigate }) {
  const [activeTab, setActiveTab]     = useState("ALL");
  const [search, setSearch]           = useState("");
  const [allComplaints, setAll]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [usingMock, setUsingMock]     = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    listComplaints(0, 100)
      .then(data => {
        if (cancelled) return;
        const items = Array.isArray(data) ? data : (data?.content ?? []);
        setAll(items.map(mapComplaint));
        setUsingMock(false);
      })
      .catch(() => {
        if (cancelled) return;
        setAll(mockComplaints);
        setUsingMock(true);
        setError("Backend offline — showing demo data.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  const filtered = allComplaints.filter(c => {
    const matchTab = activeTab === "ALL" || c.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      c.description?.toLowerCase().includes(q) ||
      c.complaintNumber?.toLowerCase().includes(q) ||
      c.wardName?.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = {
    total: allComplaints.length,
    pending: allComplaints.filter(c => ["NEW", "PENDING_REVIEW", "VERIFIED"].includes(c.status)).length,
    inProgress: allComplaints.filter(c => ["ASSIGNED", "IN_PROGRESS"].includes(c.status)).length,
    resolved: allComplaints.filter(c => ["RESOLVED", "CLOSED"].includes(c.status)).length,
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#f9fafb", 
      padding: "40px 48px", 
      fontFamily: "'Inter', sans-serif" 
    }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
          <div>
            <h1 style={{ margin: "0 0 8px", fontSize: "36px", fontWeight: 900, color: "#1e1b4b", letterSpacing: "-0.5px" }}>
              Manage Complaints
            </h1>
            <p style={{ margin: 0, color: "#6b7280", fontSize: "16px", fontWeight: 500 }}>
              Track and resolve citizen issues efficiently.
            </p>
          </div>
          <button
            onClick={() => navigate("raise")}
            style={{
              padding: "14px 28px",
              background: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: "50px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: 700,
              boxShadow: "0 8px 24px rgba(79, 70, 229, 0.25)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "transform 0.2s"
            }}
            onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseOut={e => e.currentTarget.style.transform = "none"}
          >
            <span style={{ fontSize: "20px", lineHeight: 1 }}>+</span> Raise New Issue
          </button>
        </div>

        {/* STATS GRID */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", 
          gap: "24px", 
          marginBottom: "48px" 
        }}>
          <StatCard 
            label="TOTAL COMPLAINTS" 
            value={stats.total} 
            subtitle="+12% from last month" 
            icon="📋" 
            color="#4f46e5" 
          />
          <StatCard 
            label="PENDING" 
            value={stats.pending} 
            subtitle="Requires attention" 
            icon="⏳" 
            color="#f59e0b" 
            alert
          />
          <StatCard 
            label="IN PROGRESS" 
            value={stats.inProgress} 
            subtitle="Active maintenance" 
            icon="🔄" 
            color="#3b82f6" 
          />
          <StatCard 
            label="RESOLVED" 
            value={stats.resolved} 
            subtitle={`${stats.total > 0 ? Math.round((stats.resolved/stats.total)*100) : 0}% resolution rate`} 
            icon="✅" 
            color="#10b981" 
          />
        </div>

        <div style={{ 
          display: "grid",
          gridTemplateColumns: "1fr auto auto",
          alignItems: "center", 
          gap: "24px",
          marginBottom: "32px",
          background: "rgba(255,255,255,0.6)", 
          backdropFilter: "blur(10px)",
          borderRadius: "24px", 
          padding: "16px", 
          border: "1px solid #fff",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          flexWrap: "wrap"
        }}>
          {/* SEARCH */}
          <div style={{ position: "relative", minWidth: "240px" }}>
            <span style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search complaints, ID or ward..."
              style={{
                width: "100%", 
                padding: "14px 20px 14px 52px",
                border: "none", 
                borderRadius: "16px",
                fontSize: "15px", 
                outline: "none",
                background: "#fff",
                color: "#1f2937",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
                boxSizing: "border-box"
              }}
            />
          </div>

          {/* STATUS TABS */}
          <div style={{ 
            display: "flex", 
            background: "#f3f4f6", 
            padding: "4px", 
            borderRadius: "16px",
            gap: "2px",
            flexShrink: 0
          }}>
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                style={{
                  padding: "10px 24px",
                  background: activeTab === tab.value ? "#4f46e5" : "transparent",
                  color: activeTab === tab.value ? "#fff" : "#6b7280",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 700,
                  transition: "all 0.2s",
                  whiteSpace: "nowrap"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* FILTERS BUTTON */}
          <button style={{
            padding: "12px 24px",
            background: "#fff",
            color: "#4b5563",
            border: "none",
            borderRadius: "16px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            flexShrink: 0
          }}>
            <span>≡</span> More
          </button>
        </div>

        {/* DATA STATUS BANNER */}
        {usingMock && (
          <div style={{ background: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "16px", padding: "16px", marginBottom: "32px", color: "#92400e", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>
            <span style={{ fontSize: "20px" }}>⚠️</span> {error} Fallback demo data loaded.
          </div>
        )}

        {/* COMPLAINTS LIST */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "100px 0" }}>
            <div className="spinner" style={{ width: "40px", height: "40px", border: "4px solid #f3f4f6", borderTop: "4px solid #4f46e5", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "20px" }} />
            <div style={{ color: "#6b7280", fontWeight: 500 }}>Syncing with Panchayat Ledger...</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "100px 0", background: "#fff", borderRadius: "32px", border: "2px dashed #e5e7eb" }}>
                <div style={{ fontSize: "64px", marginBottom: "20px" }}>🔍</div>
                <h3 style={{ fontSize: "20px", color: "#1f2937", margin: "0 0 8px" }}>No matching complaints</h3>
                <p style={{ color: "#6b7280" }}>Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              filtered.map(c => (
                <ComplaintCard 
                  key={c.id} 
                  complaint={c} 
                  onClick={complaint => navigate("details", complaint)} 
                />
              ))
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, subtitle, icon, color, alert }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: "28px",
      padding: "28px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
      border: "1px solid #f3f4f6",
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#9ca3af", letterSpacing: "1px", marginBottom: "12px" }}>{label}</div>
          <div style={{ fontSize: "40px", fontWeight: 800, color: "#1e1b4b", lineHeight: 1 }}>{value.toLocaleString()}</div>
        </div>
        <div style={{ 
          width: "48px", 
          height: "48px", 
          borderRadius: "16px", 
          background: `${color}10`, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          fontSize: "24px" 
        }}>
          {icon}
        </div>
      </div>
      <div style={{ 
        fontSize: "13px", 
        fontWeight: 600, 
        color: alert ? "#ef4444" : "#10b981",
        display: "flex",
        alignItems: "center",
        gap: "6px"
      }}>
        {alert ? "⚠" : "📈"} {subtitle}
      </div>
    </div>
  );
}