import { useState, useEffect } from "react";
import { listComplaints, trackComplaint, mapComplaint } from "../utils/api";
import { complaints as mockComplaints, statusConfig, typeConfig } from "../data/complaints";
import ComplaintCard from "../components/ComplaintCard";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const TABS = [
  { label: "All",         value: "ALL",            icon: "📋" },
  { label: "Pending",     value: "PENDING_REVIEW", icon: "⏳" },
  { label: "In Progress", value: "IN_PROGRESS",    icon: "🔄" },
  { label: "Resolved",    value: "RESOLVED",       icon: "✅" }
];

export default function TrackPage({ navigate }) {
  const [activeTab, setActiveTab]   = useState("ALL");
  const [search, setSearch]         = useState("");
  const [trackInput, setTrackInput] = useState("");
  const [allComplaints, setAll]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [usingMock, setUsingMock]   = useState(false);
  const [trackError, setTrackError] = useState(null);
  const [tracking, setTracking]     = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

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
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  const handleTrack = async () => {
    if (!trackInput.trim()) return;
    setTracking(true);
    setTrackError(null);
    try {
      const data = await trackComplaint(trackInput.trim());
      const mapped = mapComplaint(data);
      navigate("details", mapped);
    } catch (err) {
      setTrackError(`Complaint "${trackInput}" not found.`);
    } finally {
      setTracking(false);
    }
  };

  const filtered = allComplaints.filter(c => {
    if (activeTab === "ALL")            return true;
    if (activeTab === "PENDING_REVIEW") return ["NEW","PENDING_REVIEW"].includes(c.status);
    if (activeTab === "IN_PROGRESS")    return ["VERIFIED","ASSIGNED","IN_PROGRESS"].includes(c.status);
    if (activeTab === "RESOLVED")       return ["RESOLVED","CLOSED"].includes(c.status);
    return true;
  }).filter(c =>
    !search ||
    c.complaintNumber?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

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
              Track Grievances
            </h1>
            <p style={{ margin: 0, color: "#6b7280", fontSize: "16px", fontWeight: 500 }}>
              Real-time monitoring of your reported issues.
            </p>
          </div>
        </div>

        {/* QUICK TRACK BOX */}
        <div style={{ 
          background: "linear-gradient(135deg, #4f46e5 0%, #1d4ed8 100%)", 
          borderRadius: "32px", 
          padding: "32px", 
          marginBottom: "48px",
          boxShadow: "0 20px 50px rgba(79, 70, 229, 0.2)",
          color: "#fff"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🔍</div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 800 }}>Instant Status Lookup</div>
              <div style={{ fontSize: "13px", opacity: 0.8 }}>Enter your unique complaint ID to see detailed lifecycle progress.</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <input
              value={trackInput}
              onChange={e => setTrackInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleTrack()}
              placeholder="Enter Complaint ID (e.g. CMP-2025-1045)"
              style={{ 
                flex: 1, 
                padding: "18px 24px", 
                border: "none", 
                borderRadius: "16px", 
                fontSize: "15px", 
                outline: "none",
                fontWeight: 600,
                color: "#1e1b4b",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}
            />
            <button
              onClick={handleTrack}
              disabled={tracking}
              style={{ 
                padding: "0 36px", 
                background: "#facc15", 
                color: "#1e1b4b", 
                border: "none", 
                borderRadius: "16px", 
                cursor: "pointer", 
                fontWeight: 800,
                fontSize: "15px",
                transition: "all 0.2s"
              }}
              onMouseOver={e => !tracking && (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseOut={e => e.currentTarget.style.transform = "none"}
            >
              {tracking ? "Searching..." : "Track Now"}
            </button>
          </div>
          {trackError && <div style={{ marginTop: "16px", background: "rgba(255,255,255,0.1)", padding: "10px 16px", borderRadius: "10px", fontSize: "14px", fontWeight: 600 }}>⚠️ {trackError}</div>}
        </div>

        {/* FILTERS & SEARCH (GRID LAYOUT) */}
        <div style={{ 
          display: "grid",
          gridTemplateColumns: "1fr auto",
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
              placeholder="Search by ID or description..."
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
            {TABS.map(tab => (
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
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* LIST SECTION */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "100px 0" }}>
            <div className="spinner" style={{ width: "40px", height: "40px", border: "4px solid #f3f4f6", borderTop: "4px solid #4f46e5", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "20px" }} />
            <div style={{ color: "#6b7280", fontWeight: 500 }}>Syncing Ledger...</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "100px 0", background: "#fff", borderRadius: "32px", border: "2px dashed #e5e7eb" }}>
                <div style={{ fontSize: "64px", marginBottom: "20px" }}>📋</div>
                <h3 style={{ fontSize: "20px", color: "#1f2937", margin: "0 0 8px" }}>No complaints found</h3>
                <p style={{ color: "#6b7280" }}>Try a different category or check your complaint number.</p>
              </div>
            ) : (
              filtered.map(c => (
                <div key={c.id} style={{ display: "flex", gap: "24px" }}>
                    {/* Visual Status Marker */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "20px" }}>
                         <div style={{ 
                             width: "12px", 
                             height: "12px", 
                             borderRadius: "50%", 
                             background: statusConfig[c.status]?.bg || "#4f46e5", 
                             boxShadow: `0 0 10px ${statusConfig[c.status]?.bg || "#4f46e5"}44`,
                             zIndex: 1 
                         }} />
                         <div style={{ flex: 1, width: "2px", background: "#e5e7eb", margin: "4px 0" }} />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                        <ComplaintCard 
                             complaint={c} 
                             onClick={comp => navigate("details", comp)} 
                        />
                    </div>
                </div>
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