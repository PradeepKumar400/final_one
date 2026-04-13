import { useState, useEffect } from "react";
import { listComplaints, mapComplaint } from "../utils/api";
import { complaints as mockComplaints } from "../data/complaints";
import ComplaintCard from "../components/ComplaintCard";

const STATUS_TABS = [
  { label: "All",         value: "ALL" },
  { label: "Pending",     value: "PENDING_REVIEW" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Resolved",    value: "RESOLVED", check: true }
];

export default function ComplaintsPage({ navigate }) {
  const [activeTab, setActiveTab]     = useState("ALL");
  const [search, setSearch]           = useState("");
  const [allComplaints, setAll]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [usingMock, setUsingMock]     = useState(false);

  // ── Fetch from backend ────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    listComplaints(0, 50)
      .then(data => {
        if (cancelled) return;
        // data may be a paged wrapper or a raw array
        const items = Array.isArray(data) ? data : (data?.content ?? []);
        setAll(items.map(mapComplaint));
        setUsingMock(false);
      })
      .catch(() => {
        if (cancelled) return;
        // Backend not reachable — fall back to mock data
        setAll(mockComplaints);
        setUsingMock(true);
        setError("Backend offline — showing demo data.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = allComplaints.filter(c => {
    const matchTab = activeTab === "ALL" || c.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      c.description?.toLowerCase().includes(q) ||
      c.complaintNumber?.includes(search) ||
      c.wardName?.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  // Badge counts
  const pendingCount    = allComplaints.filter(c => c.status === "PENDING_REVIEW" || c.status === "NEW").length;
  const inProgressCount = allComplaints.filter(c => ["VERIFIED","ASSIGNED","IN_PROGRESS"].includes(c.status)).length;

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 32px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: "0 0 4px", fontSize: "28px", fontWeight: 800, color: "#111827" }}>
          Manage Complaints
        </h1>
        <p style={{ margin: 0, color: "#6b7280", fontSize: "15px" }}>
          Track and resolve citizen issues efficiently
        </p>
      </div>

      {/* Backend status banner */}
      {usingMock && (
        <div style={{
          background: "#fef3c7", border: "1px solid #fbbf24", borderRadius: "10px",
          padding: "10px 16px", marginBottom: "16px", fontSize: "13px",
          color: "#92400e", display: "flex", alignItems: "center", gap: "8px"
        }}>
          ⚠️ {error} Start the Spring Boot backend on port 8081 for live data.
        </div>
      )}
      {!usingMock && !loading && (
        <div style={{
          background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: "10px",
          padding: "10px 16px", marginBottom: "16px", fontSize: "13px",
          color: "#065f46", display: "flex", alignItems: "center", gap: "8px"
        }}>
          ✅ Connected to live backend — showing real data.
        </div>
      )}

      {/* Search & Actions */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: "16px" }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search complaints..."
            style={{
              width: "100%", padding: "10px 12px 10px 36px",
              border: "1px solid #e5e7eb", borderRadius: "10px",
              fontSize: "14px", outline: "none", fontFamily: "inherit",
              background: "#fff", boxSizing: "border-box"
            }}
          />
        </div>
        <button
          onClick={() => navigate("raise")}
          style={{
            padding: "10px 20px",
            background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
            color: "#fff", border: "none", borderRadius: "10px",
            cursor: "pointer", fontSize: "14px", fontWeight: 600,
            fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px"
          }}
        >
          + Raise New Issue
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", gap: "4px" }}>
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              style={{
                padding: "8px 16px",
                background: "none", border: "none", cursor: "pointer",
                fontSize: "14px", fontWeight: activeTab === tab.value ? 700 : 400,
                color: activeTab === tab.value ? "#1d4ed8" : "#6b7280",
                borderBottom: activeTab === tab.value ? "2px solid #1d4ed8" : "2px solid transparent",
                fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: "6px"
              }}
            >
              {tab.label}
              {tab.value === "PENDING_REVIEW" && pendingCount > 0 && (
                <span style={{ background: "#ef4444", color: "#fff", borderRadius: "50%", width: "18px", height: "18px", fontSize: "10px", fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  {pendingCount}
                </span>
              )}
              {tab.value === "IN_PROGRESS" && inProgressCount > 0 && (
                <span style={{ background: "#f59e0b", color: "#fff", borderRadius: "50%", width: "18px", height: "18px", fontSize: "10px", fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  {inProgressCount}
                </span>
              )}
              {tab.check && <span style={{ color: "#10b981" }}>✓</span>}
            </button>
          ))}
        </div>
        <span style={{ fontSize: "13px", color: "#9ca3af" }}>
          Showing {filtered.length} of {allComplaints.length} complaints
        </span>
      </div>

      {/* Complaint Cards */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
          <div>Loading complaints from backend...</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>📋</div>
              <div style={{ fontSize: "16px", fontWeight: 600 }}>No complaints found</div>
            </div>
          ) : (
            filtered.map(c => (
              <ComplaintCard key={c.id} complaint={c} onClick={complaint => navigate("details", complaint)} />
            ))
          )}
        </div>
      )}
    </div>
  );
}