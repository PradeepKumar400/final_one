import { StatusBadge, TypeIcon } from "./StatusBadge";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function ComplaintCard({ complaint, onClick }) {
  const beforePhotos = complaint.photos?.filter(p => p.stage === "BEFORE") || [];
  const afterPhotos = complaint.photos?.filter(p => p.stage === "AFTER") || [];

  return (
    <div
      onClick={() => onClick && onClick(complaint)}
      style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        cursor: "pointer",
        border: complaint.isSlaBreached ? "1.5px solid #fca5a5" : "1px solid #f3f4f6",
        transition: "box-shadow 0.2s, transform 0.15s",
        position: "relative"
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.07)"; e.currentTarget.style.transform = "none"; }}
    >
      {complaint.isSlaBreached && (
        <div style={{
          background: "#fee2e2", color: "#dc2626", fontSize: "12px", fontWeight: 600,
          padding: "4px 12px", borderRadius: "6px", marginBottom: "12px",
          display: "inline-flex", alignItems: "center", gap: "5px"
        }}>
          🚨 SLA Breached — Action Required
        </div>
      )}

      <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
        <TypeIcon type={complaint.type} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#111827" }}>
                {getComplaintTitle(complaint.type, complaint.description)}
              </h3>
              <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>
                {complaint.locationDescription?.split(",")[0] || ""} · <span style={{ color: "#2563eb", fontWeight: 600 }}>{complaint.wardName?.split("—")[0]?.trim()}</span> · {timeAgo(complaint.updatedAt)}
              </div>
            </div>
            <StatusBadge status={complaint.status} />
          </div>

          <p style={{ margin: "8px 0", fontSize: "14px", color: "#374151", lineHeight: "1.5" }}>
            {complaint.description.slice(0, 90)}{complaint.description.length > 90 ? "..." : ""}
          </p>
        </div>

        {beforePhotos.length > 0 && (
          <div style={{ flexShrink: 0, borderRadius: "10px", overflow: "hidden" }}>
            {complaint.status === "RESOLVED" && afterPhotos.length > 0 ? (
              <div style={{ display: "flex", gap: "3px" }}>
                <div style={{ position: "relative" }}>
                  <img src={beforePhotos[0].url} alt="before" style={{ width: "80px", height: "70px", objectFit: "cover" }} />
                  <span style={{ position: "absolute", bottom: "2px", left: "2px", background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: "9px", padding: "1px 4px", borderRadius: "3px" }}>Before</span>
                </div>
                <div style={{ position: "relative" }}>
                  <img src={afterPhotos[0].url} alt="after" style={{ width: "80px", height: "70px", objectFit: "cover" }} />
                  <span style={{ position: "absolute", bottom: "2px", left: "2px", background: "rgba(16,185,129,0.8)", color: "#fff", fontSize: "9px", padding: "1px 4px", borderRadius: "3px" }}>After</span>
                </div>
              </div>
            ) : (
              <img src={beforePhotos[0].url} alt="complaint" style={{ width: "90px", height: "70px", objectFit: "cover", borderRadius: "10px" }} />
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "linear-gradient(135deg,#1d4ed8,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "10px", fontWeight: 700 }}>
              {complaint.citizenName[0]}
            </div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}>
                Complaint ID: <span style={{ color: "#1d4ed8" }}>{complaint.complaintNumber}</span>
              </div>
              <div style={{ fontSize: "11px", color: "#10b981" }}>✓ {complaint.citizenName} · {complaint.citizenPhone}</div>
            </div>
          </div>
          {complaint.photos?.length > 0 && (
            <span style={{ fontSize: "12px", color: "#f59e0b", background: "#fef3c7", padding: "3px 8px", borderRadius: "8px" }}>
              📷 {complaint.photos.length} Photo{complaint.photos.length > 1 ? "s" : ""} Uploaded
            </span>
          )}
          {complaint.status === "RESOLVED" && afterPhotos.length > 0 && (
            <span style={{ fontSize: "12px", color: "#059669", background: "#d1fae5", padding: "3px 8px", borderRadius: "8px" }}>
              ✓ Before & After Proof
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "12px", color: "#9ca3af" }}>
            {new Date(complaint.updatedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} · {new Date(complaint.updatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <button style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#1d4ed8", fontSize: "13px", fontWeight: 600, fontFamily: "inherit"
          }}>
            View Details ›
          </button>
        </div>
      </div>

      {complaint.status === "IN_PROGRESS" && complaint.assignedToName && (
        <div style={{ marginTop: "10px" }}>
          <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
            Assigned to <span style={{ color: "#1d4ed8", fontWeight: 600 }}>{complaint.assignedToName}</span>
          </div>
          <div style={{ background: "#e5e7eb", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(90deg, #f59e0b, #f97316)", width: "50%", height: "100%", borderRadius: "4px" }} />
          </div>
        </div>
      )}
    </div>
  );
}

function getComplaintTitle(type, description) {
  const titles = {
    WATER: "Water Issue",
    ELECTRICITY: "Electricity Issue",
    ROAD: "Road Issue",
    SANITATION: "Sanitation Issue",
    PUBLIC_PROPERTY: "Public Property Issue",
    OTHER: "Civic Issue"
  };
  const words = description.split(" ").slice(0, 4).join(" ");
  return words.length > 20 ? titles[type] : words;
}