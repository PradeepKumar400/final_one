import { useState, useEffect } from "react";
import {
  adminListComplaints,
  listComplaints,
  adminAssign,
  wardUpdateProgress,
  mapComplaint,
} from "../utils/api";
import {
  Clock,
  CheckCircle,
  Activity,
  UserPlus,
  RefreshCw,
  MapPin,
  Phone,
  LayoutList,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const STATUS_COLOR = {
  VERIFIED: { bg: "#d1fae5", color: "#065f46", label: "Verified", icon: <CheckCircle size={14} /> },
  ASSIGNED: { bg: "#ede9fe", color: "#5b21b6", label: "Worker Assigned", icon: <UserPlus size={14} /> },
  IN_PROGRESS: { bg: "#ffedd5", color: "#92400e", label: "In Progress", icon: <Activity size={14} /> },
  RESOLVED: { bg: "#d1fae5", color: "#065f46", label: "Resolved", icon: <CheckCircle size={14} /> },
  CLOSED: { bg: "#f3f4f6", color: "#374151", label: "Closed", icon: <CheckCircle size={14} /> },
};

export default function PresidentComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Local worker list (persisted in localStorage for this demo/requirement)
  const [workers, setWorkers] = useState(() => {
    return JSON.parse(localStorage.getItem("panchayat_workers") || "[]");
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use Admin API (Now authorized for President)
      const data = await adminListComplaints({ size: 100 });
      const items = Array.isArray(data) ? data : (data?.content ?? []);
      
      // Filter for actionable complaints for the President
      const relevant = items
        .filter(c => ["VERIFIED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "NEW", "PENDING_REVIEW"].includes(c.status))
        .map(mapComplaint);
        
      setComplaints(relevant);
    } catch (e) {
      console.error(e);
      setError("Unable to sync official records. Please ensure your session is active.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAssignWorker = async (id) => {
    if (workers.length === 0) {
      alert("Please add some workers in the 'Manage Workers' tab first!");
      return;
    }

    // Simple selection UI via prompt for now, or we could build a small modal
    const workerNames = workers.map((w, i) => `${i+1}. ${w.name} (${w.skill})`).join("\n");
    const choice = prompt(`Select a worker by number:\n${workerNames}`);
    
    if (!choice) return;
    const idx = parseInt(choice) - 1;
    if (isNaN(idx) || !workers[idx]) {
      alert("Invalid selection.");
      return;
    }

    const worker = workers[idx];

    setActionLoading(true);
    try {
      await adminAssign(id, {
        technicianId: worker.id,
        technicianName: worker.name
      });
      alert(`Assigned ${worker.name} to the task!`);
      load();
    } catch (e) {
      alert("Assignment failed: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkCompleted = async (id) => {
    const notes = prompt("Enter work completion summary / remarks:");
    if (notes === null) return;

    setActionLoading(true);
    try {
      await wardUpdateProgress(id, "RESOLVED", notes, "Work verified and completed by President");
      alert("Status updated to RESOLVED!");
      load();
    } catch (e) {
      alert("Update failed: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1e293b", margin: 0 }}>
            Panchayat Work Orders
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
            Assign workers to verified complaints and monitor completion.
          </p>
        </div>
        <button 
          onClick={load}
          disabled={loading}
          style={{
            padding: "8px 16px", background: "#fff", border: "1px solid #e2e8f0",
            borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 700,
            display: "flex", alignItems: "center", gap: "8px", color: "#475569",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
          }}
        >
          <RefreshCw size={14} className={loading ? "spin" : ""} /> {loading ? "Syncing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div style={{ 
          background: "#fef2f2", padding: "16px", borderRadius: "12px", color: "#b91c1c",
          marginBottom: "20px", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px",
          border: "1px solid #fecaca"
        }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px", color: "#94a3b8" }}>
          <RefreshCw size={40} className="spin" style={{ marginBottom: "16px" }} />
          <p style={{ fontWeight: 600 }}>Fetching latest complaints...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div style={{ 
          textAlign: "center", padding: "80px 20px", background: "#f8fafc", 
          borderRadius: "20px", border: "2px dashed #e2e8f0", color: "#94a3b8" 
        }}>
          <LayoutList size={48} style={{ marginBottom: "16px", opacity: 0.3 }} />
          <h3 style={{ margin: 0, color: "#475569" }}>No complaints to display</h3>
          <p style={{ marginTop: "8px", maxWidth: "300px", marginInline: "auto" }}>
            Verified complaints from Ward Members will appear here for worker assignment.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {complaints.map((c) => {
            const st = STATUS_COLOR[c.status] || { bg: "#f1f5f9", color: "#64748b", label: c.status };
            
            return (
              <div 
                key={c.id} 
                style={{ 
                  background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", 
                  padding: "24px", transition: "all 0.2s",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                      <span style={{ fontWeight: 900, color: "#1d4ed8", fontSize: "15px" }}>#{c.complaintNumber}</span>
                      <span style={{ 
                        padding: "4px 12px", borderRadius: "100px", fontSize: "11px", fontWeight: 800,
                        background: st.bg, color: st.color, display: "flex", alignItems: "center", gap: "6px",
                        textTransform: "uppercase", letterSpacing: "0.5px"
                      }}>
                        {st.icon} {st.label}
                      </span>
                    </div>
                    <h4 style={{ margin: "0 0 4px", fontSize: "17px", color: "#0f172a", fontWeight: 800 }}>{c.type}</h4>
                    <div style={{ fontSize: "12px", color: "#64748b", display: "flex", gap: "12px", fontWeight: 600 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><MapPin size={12} /> {c.wardName}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={12} /> {new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <p style={{ margin: "0 0 20px", fontSize: "14px", color: "#334155", lineHeight: 1.6 }}>
                  {c.description}
                </p>

                <div style={{ 
                  background: "#f8fafc", padding: "16px", borderRadius: "12px", 
                  display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px"
                }}>
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>Citizen Contact</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Phone size={14} /> {c.citizenPhone || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>Location</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b" }}>{c.locationDescription}</div>
                  </div>
                </div>

                {c.assignedToName && (
                  <div style={{ 
                    background: "#f5f3ff", padding: "12px 16px", borderRadius: "12px", 
                    marginBottom: "20px", fontSize: "13px", color: "#5b21b6",
                    display: "flex", alignItems: "center", gap: "10px", border: "1px solid #ddd6fe"
                  }}>
                    <UserPlus size={18} /> 
                    <span>Work currently assigned to: <strong>{c.assignedToName}</strong></span>
                  </div>
                )}

                <div style={{ display: "flex", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "20px" }}>
                  {(c.status === "VERIFIED" || c.status === "NEW") && (
                    <button 
                      onClick={() => handleAssignWorker(c.id)}
                      disabled={actionLoading}
                      style={{
                        padding: "10px 20px", background: "#7c3aed", color: "#fff", border: "none",
                        borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: 800,
                        display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s"
                      }}
                      onMouseOver={e => e.currentTarget.style.background = "#6d28d9"}
                      onMouseOut={e => e.currentTarget.style.background = "#7c3aed"}
                    >
                      <UserPlus size={16} /> Assign Worker
                    </button>
                  )}
                  
                  {["ASSIGNED", "IN_PROGRESS"].includes(c.status) && (
                    <button 
                      onClick={() => handleMarkCompleted(c.id)}
                      disabled={actionLoading}
                      style={{
                        padding: "10px 20px", background: "#10b981", color: "#fff", border: "none",
                        borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: 800,
                        display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s"
                      }}
                      onMouseOver={e => e.currentTarget.style.background = "#059669"}
                      onMouseOut={e => e.currentTarget.style.background = "#10b981"}
                    >
                      <CheckCircle size={16} /> Mark Work as Completed
                    </button>
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
