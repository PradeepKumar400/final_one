import { useState, useEffect } from "react";
import { listComplaints, trackComplaint, mapComplaint } from "../utils/api";
import { complaints as mockComplaints } from "../data/complaints";
import ComplaintCard from "../components/ComplaintCard";
import { 
  Search, 
  Filter, 
  Clock, 
  Activity, 
  CheckCircle, 
  XCircle, 
  LayoutList, 
  FileX, 
  TrendingUp,
  AlertTriangle
} from "lucide-react";

const TABS = [
  { label: "All Grievances", value: "ALL", icon: <LayoutList size={16} /> },
  { label: "Pending", value: "PENDING_REVIEW", icon: <Clock size={16} /> },
  { label: "In Progress", value: "IN_PROGRESS", icon: <Activity size={16} /> },
  { label: "Resolved", value: "RESOLVED", icon: <CheckCircle size={16} /> },
];

export default function TrackPage({ navigate }) {
  const [trackInput, setTrackInput] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [allComplaints, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(false);
  const [trackError, setTrackError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listComplaints(0, 100)
      .then((data) => {
        if (cancelled) return;
        const items = Array.isArray(data) ? data : data?.content ?? [];
        setAll(items.map(mapComplaint));
      })
      .catch(() => {
        if (cancelled) return;
        setAll(mockComplaints.map(mapComplaint));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleTrack = async () => {
    if (!trackInput.trim()) return;
    setTracking(true);
    setTrackError(null);
    try {
      const data = await trackComplaint(trackInput.trim());
      const mapped = mapComplaint(data);
      if (mapped) {
        navigate("details", mapped);
      } else {
        setTrackError("Complaint profile not found. Please verify the ID.");
      }
    } catch (e) {
      setTrackError(e.message || "Invalid Complaint ID");
    } finally {
      setTracking(false);
    }
  };

  const filtered = allComplaints.filter((c) => {
    const matchTab = activeTab === "ALL" || c.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      c.description?.toLowerCase().includes(q) ||
      c.complaintNumber?.toLowerCase().includes(q) ||
      c.wardName?.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "100px 48px 60px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* TOP HEADER */}
        <div style={{ marginBottom: "40px" }}>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: 900,
              color: "#1e1b4b",
              margin: "0 0 10px",
            }}
          >
            Track Grievances
          </h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "16px" }}>
            Monitor the lifecycle of public issues in real-time.
          </p>
        </div>

        {/* UNIFIED SEARCH & FILTERS */}
        <div style={{ 
          background: "#fff", 
          borderRadius: "24px", 
          padding: "32px", 
          boxShadow: "0 10px 40px rgba(0,0,0,0.04)", 
          marginBottom: "40px",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
          border: "1px solid #f1f5f9"
        }}>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, minWidth: "300px" }}>
              <Search
                size={20}
                style={{
                  position: "absolute",
                  left: "20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search history, location or Ward Name..."
                style={{
                  width: "100%",
                  padding: "18px 20px 18px 56px",
                  border: "2px solid #f1f5f9",
                  borderRadius: "18px",
                  fontSize: "15px",
                  outline: "none",
                  background: "#f8fafc",
                  color: "#1e293b",
                  transition: "all 0.2s",
                  boxSizing: "border-box"
                }}
                onFocus={e => e.target.style.borderColor = "#4f46e5"}
                onBlur={e => e.target.style.borderColor = "#f1f5f9"}
              />
            </div>

            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              background: "#fff", 
              borderRadius: "18px", 
              padding: "4px 4px 4px 20px",
              gap: "12px",
              border: "2px solid #f1f5f9",
              minWidth: "250px"
            }}>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#64748b" }}>Track ID</span>
              <input 
                value={trackInput}
                onChange={e => setTrackInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleTrack()}
                placeholder="CMP-..." 
                style={{ 
                  background: "#f8fafc", 
                  border: "1px solid #e2e8f0", 
                  borderRadius: "12px", 
                  padding: "12px 14px", 
                  color: "#1e293b", 
                  fontSize: "14px", 
                  outline: "none",
                  width: "100px"
                }}
              />
              <button onClick={handleTrack} style={{ 
                background: "#4f46e5", 
                border: "none", 
                borderRadius: "14px", 
                padding: "14px 24px", 
                fontWeight: 800, 
                color: "#fff", 
                cursor: "pointer",
                fontSize: "14px",
                boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)"
              }}>
                {tracking ? "..." : "Track"}
              </button>
            </div>
          </div>

          {trackError && (
            <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", padding: "12px 20px", borderRadius: "14px", color: "#dc2626", fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", gap: "10px" }}>
              <AlertTriangle size={18} /> {trackError}
            </div>
          )}

          {/* STATUS FILTERS */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", borderTop: "1px solid #f1f5f9", paddingTop: "24px" }}>
            <span style={{ fontSize: "12px", fontWeight: 900, color: "#94a3b8", alignSelf: "center", marginRight: "12px", letterSpacing: "0.5px" }}>FILTER:</span>
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                style={{
                  padding: "10px 22px",
                  background: activeTab === tab.value ? "#4f46e5" : "#fff",
                  color: activeTab === tab.value ? "#fff" : "#64748b",
                  border: `1.5px solid ${activeTab === tab.value ? "#4f46e5" : "#e2e8f0"}`,
                  borderRadius: "100px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 700,
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* LIST SECTION */}
        {loading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "100px 0",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "4px solid #f3f4f6",
                borderTop: "4px solid #4f46e5",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginBottom: "20px",
              }}
            />
            <div style={{ color: "#6b7280", fontWeight: 500 }}>
              Syncing Ledger...
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {filtered.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "80px 0",
                  background: "#fff",
                  borderRadius: "32px",
                  border: "2px dashed #e2e8f0",
                }}
              >
                <FileX
                  size={48}
                  color="#94a3b8"
                  style={{ marginBottom: "16px" }}
                />
                <div
                  style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b" }}
                >
                  No records found
                </div>
                <div style={{ color: "#64748b", marginTop: "4px" }}>
                  Try adjusting your search or filters.
                </div>
              </div>
            ) : (
              filtered.map((c) => (
                <ComplaintCard
                  key={c.id}
                  complaint={c}
                  onClick={(comp) => navigate("details", comp)}
                />
              ))
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
