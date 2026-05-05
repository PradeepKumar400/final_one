import { useState, useEffect } from "react";
import { 
  wardListComplaints, 
  wardVerify, 
  mapComplaint, 
  getWardId 
} from "../utils/api";
import { 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  RefreshCw, 
  MapPin, 
  Phone, 
  AlertCircle 
} from "lucide-react";

const STATUS_COLOR = {
  NEW: { bg: "#dbeafe", color: "#1e40af", label: "New", icon: <Clock size={14} /> },
  PENDING_REVIEW: { bg: "#fef3c7", color: "#92400e", label: "Pending", icon: <Clock size={14} /> },
  VERIFIED: { bg: "#d1fae5", color: "#065f46", label: "Verified", icon: <CheckCircle size={14} /> },
  REJECTED: { bg: "#fee2e2", color: "#991b1b", label: "Rejected", icon: <ShieldCheck size={14} /> },
  ESCALATED: { bg: "#fee2e2", color: "#b91c1c", label: "Escalated", icon: <AlertCircle size={14} /> },
};

export default function WardComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const wardId = getWardId();

  const load = async () => {
    setLoading(true);
    try {
      const data = await wardListComplaints(wardId, null, 0, 100);
      const items = Array.isArray(data) ? data : (data?.content ?? []);
      setComplaints(items.map(mapComplaint));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleVerify = async (complaintId) => {
    if (!confirm("Are you sure you want to verify this complaint? It will be sent to the President for worker assignment.")) return;
    
    setActionLoading(complaintId);
    const payload = { 
      approved: true, 
      status: "VERIFIED",
      priority: "NORMAL", 
      remarks: "Verified by Ward Member",
      rejectionReason: ""
    };
    console.log("Verifying complaint with payload:", payload);
    try {
      await wardVerify(complaintId, payload);
      load();
    } catch (e) {
      alert("Verification failed: " + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ marginTop: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1e293b", margin: 0 }}>
          Ward Complaints
        </h2>
        <button 
          onClick={load}
          style={{
            padding: "8px 16px", background: "#fff", border: "1px solid #e2e8f0",
            borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 700,
            display: "flex", alignItems: "center", gap: "8px", color: "#475569"
          }}
        >
          <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px", color: "#94a3b8" }}>
          <RefreshCw size={32} className="spin" style={{ marginBottom: "12px" }} />
          <p>Syncing complaints...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", background: "#f8fafc", borderRadius: "16px", border: "2px dashed #e2e8f0" }}>
          <p style={{ color: "#64748b", fontWeight: 700 }}>No active complaints in your ward.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {complaints.map((c) => {
            const st = STATUS_COLOR[c.status] || { bg: "#f1f5f9", color: "#64748b", label: c.status };
            const isVerified = c.status === "VERIFIED" || c.status === "ASSIGNED" || c.status === "IN_PROGRESS" || c.status === "RESOLVED";
            const isActionable = c.status === "NEW" || c.status === "PENDING_REVIEW";

            return (
              <div 
                key={c.id} 
                style={{ 
                  background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", 
                  padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 800, color: "#1d4ed8", fontSize: "14px" }}>#{c.complaintNumber}</span>
                      <span style={{ 
                        padding: "4px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 700,
                        background: st.bg, color: st.color, display: "flex", alignItems: "center", gap: "4px"
                      }}>
                        {st.icon} {st.label}
                      </span>
                    </div>
                    <h4 style={{ margin: 0, fontSize: "16px", color: "#0f172a" }}>{c.type}</h4>
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <p style={{ margin: "0 0 16px", fontSize: "14px", color: "#374151", lineHeight: 1.5 }}>
                  {c.description}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "20px", fontSize: "12px", color: "#64748b" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <MapPin size={14} /> {c.locationDescription}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Phone size={14} /> {c.citizenPhone || "Contact in Detail"}
                  </div>
                </div>

                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
                  {isActionable || isVerified ? (
                    <button 
                      onClick={() => handleVerify(c.id)}
                      disabled={isVerified || actionLoading === c.id}
                      style={{
                        padding: "8px 24px", 
                        background: isVerified ? "#d1fae5" : "#065f46", 
                        color: isVerified ? "#065f46" : "#fff", 
                        border: "none",
                        borderRadius: "8px", 
                        cursor: isVerified ? "default" : "pointer", 
                        fontSize: "13px", 
                        fontWeight: 800,
                        display: "flex", 
                        alignItems: "center", 
                        gap: "8px",
                        transition: "all 0.2s"
                      }}
                    >
                      {actionLoading === c.id ? <RefreshCw size={14} className="spin" /> : <ShieldCheck size={16} />}
                      {isVerified ? "Verified" : "Verify"}
                    </button>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ef4444", fontSize: "13px", fontWeight: 700 }}>
                      <AlertCircle size={16} /> Cannot verify {c.status.toLowerCase()} issue
                    </div>
                  )}
                  
                  {isVerified && (
                    <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#059669", fontWeight: 700 }}>
                      ✓ Moved to President for Worker Assignment
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
