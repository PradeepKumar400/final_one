import { useState, useEffect } from "react";
import { listComplaints, trackComplaint, mapComplaint } from "../utils/api";
import { complaints as mockComplaints, statusConfig, typeConfig } from "../data/complaints";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const TABS = [
  { label: "Pending",     value: "PENDING_REVIEW", icon: "⏳" },
  { label: "In Progress", value: "IN_PROGRESS",    icon: "🔄" },
  { label: "Resolved",    value: "RESOLVED",       icon: "✅" }
];

const STATUS_ORDER = ["NEW","PENDING_REVIEW","VERIFIED","ASSIGNED","IN_PROGRESS","RESOLVED","CLOSED"];

export default function TrackPage({ navigate }) {
  const [activeTab, setActiveTab]   = useState("IN_PROGRESS");
  const [search, setSearch]         = useState("");
  const [trackInput, setTrackInput] = useState("");
  const [allComplaints, setAll]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [usingMock, setUsingMock]   = useState(false);
  const [trackError, setTrackError] = useState(null);
  const [tracking, setTracking]     = useState(false);

  // ── Fetch all ─────────────────────────────────────────────────────────────
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

  // ── Track by number ────────────────────────────────────────────────────────
  const handleTrack = async () => {
    if (!trackInput.trim()) return;
    setTracking(true);
    setTrackError(null);
    try {
      const data = await trackComplaint(trackInput.trim());
      const mapped = mapComplaint(data);
      navigate("details", mapped);
    } catch (err) {
      setTrackError(`Complaint "${trackInput}" not found. ${err.message}`);
    } finally {
      setTracking(false);
    }
  };

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = allComplaints.filter(c => {
    if (activeTab === "PENDING_REVIEW") return ["NEW","PENDING_REVIEW"].includes(c.status);
    if (activeTab === "IN_PROGRESS")   return ["VERIFIED","ASSIGNED","IN_PROGRESS"].includes(c.status);
    if (activeTab === "RESOLVED")      return ["RESOLVED","CLOSED"].includes(c.status);
    return true;
  }).filter(c =>
    !search ||
    c.complaintNumber?.includes(search) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const getProgress = (status) => {
    const idx = STATUS_ORDER.indexOf(status);
    return Math.round((idx / (STATUS_ORDER.length - 1)) * 100);
  };

  const tabCount = (tab) => allComplaints.filter(c => {
    if (tab === "PENDING_REVIEW") return ["NEW","PENDING_REVIEW"].includes(c.status);
    if (tab === "IN_PROGRESS")   return ["VERIFIED","ASSIGNED","IN_PROGRESS"].includes(c.status);
    if (tab === "RESOLVED")      return ["RESOLVED","CLOSED"].includes(c.status);
    return false;
  }).length;

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 32px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: "0 0 4px", fontSize: "28px", fontWeight: 800, color: "#111827" }}>Track Issues</h1>
        <p style={{ margin: 0, color: "#6b7280", fontSize: "15px" }}>Monitor the status of reported complaints</p>
      </div>

      {/* Quick track by number */}
      <div style={{ background: "#fff", borderRadius: "16px", padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: "24px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "10px" }}>
          🔎 Track by Complaint Number
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            value={trackInput}
            onChange={e => setTrackInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleTrack()}
            placeholder="e.g. CMP-2025-1045"
            style={{ flex: 1, padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none", fontFamily: "inherit" }}
          />
          <button
            onClick={handleTrack}
            disabled={tracking}
            style={{ padding: "10px 20px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}
          >
            {tracking ? "⏳" : "Track"}
          </button>
        </div>
        {trackError && <div style={{ marginTop: "8px", fontSize: "13px", color: "#dc2626" }}>⚠️ {trackError}</div>}
        {usingMock && !loading && (
          <div style={{ marginTop: "8px", fontSize: "12px", color: "#92400e" }}>
            ⚠️ Backend offline — tracking works against demo data only.
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search complaints..."
            style={{ width: "100%", padding: "10px 12px 10px 36px", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none", fontFamily: "inherit", background: "#fff", boxSizing: "border-box" }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              style={{
                padding: "8px 16px",
                background: activeTab === tab.value ? "#eff6ff" : "#fff",
                border: activeTab === tab.value ? "1px solid #bfdbfe" : "1px solid #e5e7eb",
                borderRadius: "10px", cursor: "pointer",
                fontSize: "14px", fontWeight: activeTab === tab.value ? 700 : 400,
                color: activeTab === tab.value ? "#1d4ed8" : "#6b7280",
                fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px"
              }}
            >
              {tab.icon} {tab.label}
              <span style={{
                background: activeTab === tab.value ? "#1d4ed8" : "#e5e7eb",
                color: activeTab === tab.value ? "#fff" : "#6b7280",
                borderRadius: "50%", width: "20px", height: "20px",
                fontSize: "11px", fontWeight: 700,
                display: "inline-flex", alignItems: "center", justifyContent: "center"
              }}>{tabCount(tab.value)}</span>
            </button>
          ))}
        </div>
        <span style={{ fontSize: "13px", color: "#9ca3af" }}>
          Showing {filtered.length} of {allComplaints.length} complaints
        </span>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
          <div>Loading from backend...</div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "16px" }}>
          {/* Timeline dots */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "20px" }}>
            {filtered.map((c, i) => {
              const cfg = statusConfig[c.status];
              return (
                <div key={c.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: cfg?.bg || "#f3f4f6", border: `2px solid ${cfg?.dot || "#d1d5db"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
                    {c.status === "IN_PROGRESS" ? "🔄" : c.status === "RESOLVED" || c.status === "CLOSED" ? "✓" : c.status === "NEW" ? "📋" : "⏳"}
                  </div>
                  {i < filtered.length - 1 && (
                    <div style={{ width: "2px", height: "calc(100% - 32px)", minHeight: "100px", background: "#e5e7eb", flex: 1 }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Cards */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>📋</div>
                <div style={{ fontSize: "16px", fontWeight: 600 }}>No complaints in this category</div>
              </div>
            ) : filtered.map(c => {
              const type = typeConfig[c.type] || typeConfig.OTHER;
              const status = statusConfig[c.status] || statusConfig.NEW;
              const progress = getProgress(c.status);
              const beforePhoto = c.photos?.find(p => p.stage === "BEFORE");
              const afterPhoto  = c.photos?.find(p => p.stage === "AFTER");

              return (
                <div
                  key={c.id}
                  onClick={() => navigate("details", c)}
                  style={{
                    background: "#fff", borderRadius: "16px", padding: "20px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.07)", cursor: "pointer",
                    border: "1px solid #f3f4f6", transition: "all 0.2s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.07)"; }}
                >
                  <div style={{ display: "flex", gap: "14px" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: type.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
                      {type.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                              {c.description.split(" ").slice(0, 4).join(" ")}...
                            </h3>
                            <span style={{ fontSize: "12px", color: "#1d4ed8", fontWeight: 600 }}>#{c.complaintNumber}</span>
                          </div>
                          <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>
                            {c.wardName} · {timeAgo(c.updatedAt || c.createdAt)}
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                          <span style={{ padding: "4px 12px", borderRadius: "20px", background: status.bg, color: status.color, fontSize: "12px", fontWeight: 600 }}>
                            {status.label}
                          </span>
                        </div>
                      </div>

                      <p style={{ margin: "8px 0", fontSize: "13px", color: "#374151" }}>
                        {c.description.slice(0, 80)}{c.description.length > 80 ? "..." : ""}
                      </p>

                      {["IN_PROGRESS","ASSIGNED"].includes(c.status) && (
                        <div style={{ marginBottom: "10px" }}>
                          <div style={{ background: "#e5e7eb", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                            <div style={{ background: "linear-gradient(90deg, #f59e0b, #f97316)", width: `${progress}%`, height: "100%", borderRadius: "4px" }} />
                          </div>
                          <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>{progress}% Work Completed</div>
                        </div>
                      )}
                    </div>

                    {beforePhoto && (
                      <div style={{ flexShrink: 0 }}>
                        {afterPhoto ? (
                          <div style={{ display: "flex", gap: "3px" }}>
                            <img src={beforePhoto.url} alt="before" style={{ width: "75px", height: "60px", objectFit: "cover", borderRadius: "8px" }} />
                            <img src={afterPhoto.url}  alt="after"  style={{ width: "75px", height: "60px", objectFit: "cover", borderRadius: "8px" }} />
                          </div>
                        ) : (
                          <img src={beforePhoto.url} alt="complaint" style={{ width: "90px", height: "70px", objectFit: "cover", borderRadius: "10px" }} />
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#1d4ed8", fontWeight: 600 }}>
                      ✓ {c.complaintNumber}
                    </span>
                    {c.assignedToName && (
                      <span style={{ fontSize: "12px", color: "#374151" }}>
                        📍 Assigned to <span style={{ color: "#1d4ed8", fontWeight: 600 }}>{c.assignedToName}</span>
                      </span>
                    )}
                    {c.citizenName && (
                      <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 600 }}>
                        ✓ {c.citizenName}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}