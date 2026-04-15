import { MapPin, Clock, ArrowRight, Construction, Trash2, Building2, Zap, Droplets, FileText, AlertTriangle } from "lucide-react";

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
  const beforePhoto = complaint.photos?.find(p => p.stage?.toUpperCase() === "BEFORE")?.url;

  return (
    <div
      onClick={() => onClick && onClick(complaint)}
      style={{
        background: "#fff",
        borderRadius: "20px",
        padding: "20px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
        cursor: "pointer",
        border: complaint.isSlaBreached ? "2px solid #fee2e2" : "1px solid #f3f4f6",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        gap: "20px",
        position: "relative",
        minHeight: "180px",
        height: "180px",
        boxSizing: "border-box"
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
          width: "48px",
          height: "48px",
          borderRadius: "14px",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 16px rgba(0,0,0,0.06)",
        }}>
          {getTypeIcon(complaint.type)}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: "17px", fontWeight: 800, color: "#1e1b4b" }}>
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
                fontSize: "10px", 
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}>
                <AlertTriangle size={12} /> SLA
              </span>
            )}
          </div>
        </div>

        {/* METADATA */}
        <div style={{ 
          display: "flex", 
          gap: "16px", 
          marginBottom: "10px",
          color: "#6b7280",
          fontSize: "12px",
          fontWeight: 600
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <MapPin size={14} /> {complaint.wardName?.split("-")[0] || complaint.wardId}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Clock size={14} /> {timeAgo(complaint.createdAt)}
          </div>
        </div>

        {/* DESCRIPTION + PHOTO WRAPPER */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "12px", flex: 1, overflow: "hidden" }}>
          <p style={{ 
            flex: 1,
            margin: 0, 
            fontSize: "13px", 
            color: "#4b5563", 
            lineHeight: "1.4",
            fontWeight: 500,
            display: "-webkit-box",
            WebkitLineClamp: "3",
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}>
            {complaint.description}
          </p>
          
          {beforePhoto && (
            <div style={{ flexShrink: 0 }}>
              <img 
                src={beforePhoto} 
                alt="Complaint" 
                style={{ 
                  width: "80px", 
                  height: "60px", 
                  objectFit: "cover", 
                  borderRadius: "10px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                }} 
              />
            </div>
          )}
        </div>

        {/* LINK */}
        <div style={{ 
          color: "#4f46e5", 
          fontSize: "13px", 
          fontWeight: 700, 
          display: "flex", 
          alignItems: "center", 
          gap: "6px",
          marginTop: "auto"
        }}>
          View Details <ArrowRight size={14} />
        </div>
      </div>
    </div>
  );
}

function getTypeIcon(type) {
  const size = 20;
  const color = "#4f46e5";
  const icons = {
    INFRASTRUCTURE: <Construction size={size} color={color} />,
    SANITATION: <Trash2 size={size} color={color} />,
    PUBLIC_SERVICES: <Building2 size={size} color={color} />,
    ELECTRICITY: <Zap size={size} color={color} />,
    WATER: <Droplets size={size} color={color} />,
    OTHER: <FileText size={size} color={color} />
  };
  return icons[type] || <FileText size={size} color={color} />;
}

function getSmartTitle(desc, type) {
  if (!desc) return "New Grievance";
  const words = desc.split(" ");
  if (words.length > 5) return words.slice(0, 5).join(" ") + "...";
  return desc;
}
