import { StatusBadge, TypeIcon } from "./StatusBadge";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return `Just now`;
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function ComplaintCard({ complaint, onClick }) {
  const isEscalated = complaint.status === "ESCALATED";
  const beforePhoto = complaint.photos?.find(p => p.stage?.toUpperCase() === "BEFORE")?.url;

  return (
    <div
      onClick={() => onClick && onClick(complaint)}
      style={{
        background: "#fff",
        borderRadius: "32px",
        padding: "32px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
        cursor: "pointer",
        border: complaint.isSlaBreached ? "2px solid #fee2e2" : "1px solid #f3f4f6",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        gap: "24px",
        position: "relative"
      }}
      onMouseEnter={e => { 
        e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.08)"; 
        e.currentTarget.style.transform = "translateY(-4px)"; 
      }}
      onMouseLeave={e => { 
        e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.04)"; 
        e.currentTarget.style.transform = "none"; 
      }}
    >
      {/* ICON AREA */}
      <div style={{ flexShrink: 0 }}>
        <div style={{
          width: "64px",
          height: "64px",
          borderRadius: "20px",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 16px rgba(0,0,0,0.06)",
          fontSize: "28px"
        }}>
          {getTypeIcon(complaint.type)}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#1e1b4b" }}>
              {getSmartTitle(complaint.description, complaint.type)}
            </h3>
            <span style={{ 
              background: "#ede9fe", 
              color: "#6366f1", 
              padding: "4px 10px", 
              borderRadius: "8px", 
              fontSize: "11px", 
              fontWeight: 800,
              letterSpacing: "0.5px"
            }}>
              {complaint.complaintNumber}
            </span>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
            {complaint.isSlaBreached && (
              <span style={{ 
                background: "#fee2e2", 
                color: "#ef4444", 
                padding: "4px 12px", 
                borderRadius: "100px", 
                fontSize: "11px", 
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                ! SLA BREACHED
              </span>
            )}
            {isEscalated && (
              <button style={{
                background: "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                padding: "8px 20px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer"
              }}>
                Escalated
              </button>
            )}
            <button style={{
              background: "#fff",
              color: "#374151",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "8px 20px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.03)"
            }}>
              Assign Team
            </button>
          </div>
        </div>

        {/* METADATA */}
        <div style={{ 
          display: "flex", 
          gap: "24px", 
          marginBottom: "16px",
          color: "#6b7280",
          fontSize: "14px",
          fontWeight: 600
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "16px" }}>📍</span> {complaint.wardName?.split("-")[0] || complaint.wardId}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "16px" }}>🕒</span> {timeAgo(complaint.createdAt)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "16px" }}>👤</span> {complaint.citizenName || "John Doe (Citizen)"}
          </div>
        </div>

        {/* DESCRIPTION + PHOTO WRAPPER */}
        <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
          <p style={{ 
            flex: 1,
            margin: 0, 
            fontSize: "15px", 
            color: "#4b5563", 
            lineHeight: "1.6",
            fontWeight: 500
          }}>
            {complaint.description.length > 220 ? complaint.description.slice(0, 220) + "..." : complaint.description}
          </p>
          
          {beforePhoto && (
            <div style={{ flexShrink: 0 }}>
              <img 
                src={beforePhoto} 
                alt="Complaint" 
                style={{ 
                  width: "140px", 
                  height: "100px", 
                  objectFit: "cover", 
                  borderRadius: "20px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                }} 
              />
            </div>
          )}
        </div>

        {/* LINK */}
        <div style={{ 
          color: "#4f46e5", 
          fontSize: "14px", 
          fontWeight: 700, 
          display: "flex", 
          alignItems: "center", 
          gap: "6px" 
        }}>
          View Full Details →
        </div>
      </div>
    </div>
  );
}

function getTypeIcon(type) {
  const icons = {
    INFRASTRUCTURE: "🏢",
    SANITATION: "🗑️",
    PUBLIC_SERVICES: "🏛️",
    ELECTRICITY: "⚡",
    WATER: "💧",
    OTHER: "📋"
  };
  return icons[type] || "📋";
}

function getSmartTitle(desc, type) {
  if (!desc) return "New Grievance";
  const words = desc.split(" ");
  if (words.length > 5) return words.slice(0, 5).join(" ") + "...";
  return desc;
}