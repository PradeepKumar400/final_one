import { useState, useEffect } from "react";
import {
  wardListComplaints, wardAcknowledge, wardUpdateProgress,
  wardComment, mapComplaint, getUser, getNotifications
} from "../utils/api";
import { 
  LayoutDashboard, 
  ArrowLeft, 
  Clock, 
  Activity, 
  CheckCircle, 
  RefreshCw, 
  AlertCircle, 
  Phone, 
  ChevronUp, 
  ChevronDown, 
  MapPin, 
  MessageSquare, 
  Camera,
  FileText,
  User,
  Bell
} from "lucide-react";

const STATUS_COLOR = {
  NEW:            { bg: "#dbeafe", color: "#1e40af", label: "New", icon: <Clock size={12} /> },
  PENDING_REVIEW: { bg: "#fef3c7", color: "#92400e", label: "Pending", icon: <Clock size={12} /> },
  VERIFIED:       { bg: "#d1fae5", color: "#065f46", label: "Verified", icon: <CheckCircle size={12} /> },
  ASSIGNED:       { bg: "#ede9fe", color: "#5b21b6", label: "Assigned", icon: <User size={12} /> },
  IN_PROGRESS:    { bg: "#ffedd5", color: "#92400e", label: "In Progress", icon: <Activity size={12} /> },
  RESOLVED:       { bg: "#d1fae5", color: "#065f46", label: "Resolved", icon: <CheckCircle size={12} /> },
  CLOSED:         { bg: "#f3f4f6", color: "#374151", label: "Closed", icon: <CheckCircle size={12} /> },
  REJECTED:       { bg: "#fee2e2", color: "#991b1b", label: "Rejected", icon: <AlertCircle size={12} /> },
  ESCALATED:      { bg: "#fee2e2", color: "#7f1d1d", label: "Escalated", icon: <AlertCircle size={12} /> },
};

export default function WardDashboard({ navigate }) {
  const user = getUser();
  const wardId = user?.wardId;

  const [complaints, setComplaints]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [expanded, setExpanded]       = useState(null);

  const [progressModal, setProgressModal] = useState(null);
  const [commentModal, setCommentModal]   = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError]     = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif]         = useState(false);

  const load = async () => {
    if (!wardId) return;
    setLoading(true);
    try {
      const data = await wardListComplaints(wardId, filterStatus || undefined, 0, 50);
      const items = Array.isArray(data) ? data : (data?.content ?? []);
      setComplaints(items.map(mapComplaint));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifs = async () => {
    if (!user?.userId) return;
    try {
      const data = await getNotifications(user.userId);
      setNotifications(data || []);
    } catch (e) {
      console.error("Notif fetch failed", e);
    }
  };

  useEffect(() => { load(); loadNotifs(); }, [filterStatus, wardId]);

  const doAcknowledge = async (id) => {
    setActionLoading(true); setActionError(null);
    try {
      await wardAcknowledge(id);
      load();
    } catch (e) { setActionError(e.message); }
    finally { setActionLoading(false); }
  };

  const doProgress = async (id, status, notes, remarks) => {
    setActionLoading(true); setActionError(null);
    try {
      await wardUpdateProgress(id, status, notes, remarks);
      setProgressModal(null); load();
    } catch (e) { setActionError(e.message); }
    finally { setActionLoading(false); }
  };

  const doComment = async (id, message, isPublic) => {
    setActionLoading(true); setActionError(null);
    try {
      await wardComment(id, message, isPublic);
      setCommentModal(null); load();
    } catch (e) { setActionError(e.message); }
    finally { setActionLoading(false); }
  };

  const counts = {
    NEW:         complaints.filter(c => c.status === "NEW").length,
    PENDING:     complaints.filter(c => c.status === "PENDING_REVIEW").length,
    IN_PROGRESS: complaints.filter(c => ["ASSIGNED","IN_PROGRESS"].includes(c.status)).length,
    RESOLVED:    complaints.filter(c => ["RESOLVED","CLOSED"].includes(c.status)).length,
  };

  return (
    <div style={{ width: "100%", padding: "100px 48px 40px", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: 800, color: "#111827", display: "flex", alignItems: "center", gap: "10px" }}>
            <LayoutDashboard size={24} color="#10b981" /> Ward Member Dashboard
          </h1>
          <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
            Welcome, <strong>{user?.fullName}</strong> · Managing Ward: <strong>{user?.wardName || wardId}</strong>
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Notification Bell */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowNotif(!showNotif)}
              style={{ padding: "10px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", cursor: "pointer", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={20} color="#6b7280" />
              {notifications.length > 0 && <span style={{ position: "absolute", top: -4, right: -4, background: "#ef4444", color: "#fff", fontSize: "10px", fontWeight: 800, padding: "2px 6px", borderRadius: "10px", border: "2px solid #fff" }}>{notifications.length}</span>}
            </button>

            {showNotif && (
              <div style={{ position: "absolute", top: "50px", right: 0, width: "320px", background: "#fff", borderRadius: "16px", boxShadow: "0 20px 50px rgba(0,0,0,0.15)", border: "1px solid #f3f4f6", zIndex: 100, maxHeight: "400px", overflowY: "auto" }}>
                <div style={{ padding: "16px", borderBottom: "1px solid #f3f4f6", fontWeight: 800, fontSize: "14px", color: "#111827", display: "flex", justifyContent: "space-between" }}>
                  Notifications
                  <button onClick={() => setShowNotif(false)} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "12px" }}>Close</button>
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: "40px 20px", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>No new notifications</div>
                ) : (
                  notifications.map((n, i) => (
                    <div key={i} style={{ padding: "16px", borderBottom: "1px solid #f9fafb", cursor: "pointer" }} onClick={() => setShowNotif(false)}>
                      <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#374151", lineHeight: "1.4" }}>{n.message}</p>
                      <span style={{ fontSize: "10px", color: "#9ca3af", fontWeight: 600 }}>{new Date(n.sentAt).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <button onClick={() => navigate("home")}
            style={{ padding: "8px 16px", background: "#f3f4f6", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "inherit", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
            <ArrowLeft size={14} /> Citizen View
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        {[
          { label: "New Issues", v: counts.NEW, icon: <Clock size={20} />, color: "#1d4ed8", bg: "#eff6ff" },
          { label: "Pending",     v: counts.PENDING, icon: <Clock size={20} />, color: "#92400e", bg: "#fffbeb" },
          { label: "Active",      v: counts.IN_PROGRESS, icon: <Activity size={20} />, color: "#c2410c", bg: "#fff7ed" },
          { label: "Resolved",    v: counts.RESOLVED, icon: <CheckCircle size={20} />, color: "#065f46", bg: "#ecfdf5" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: "20px", padding: "24px", border: `1px solid #f3f4f6`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#111827" }}>{s.v}</div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "13px", fontFamily: "inherit", background: "#fff", outline: "none" }}>
          <option value="">All Statuses</option>
          {Object.entries(STATUS_COLOR).map(([v, c]) => (
            <option key={v} value={v}>{c.label}</option>
          ))}
        </select>
        <button onClick={load} style={{ padding: "10px 16px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontFamily: "inherit", color: "#1d4ed8", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
          <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
        </button>
        <span style={{ marginLeft: "auto", fontSize: "13px", color: "#6b7280", fontWeight: 600 }}>
          {complaints.length} Records Found
        </span>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "100px 0", color: "#9ca3af" }}>
          <RefreshCw size={48} style={{ animation: "spin 2s linear infinite", marginBottom: "16px" }} />
          <p style={{ fontWeight: 600 }}>Fetching Ward Ledger...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div style={{ textAlign: "center", padding: "100px 0", color: "#9ca3af", background: "#f9fafb", borderRadius: "20px", border: "1.5px dashed #e2e8f0" }}>
          <FileText size={64} style={{ marginBottom: "20px" }} />
          <h3 style={{ fontSize: "18px", color: "#4b5563" }}>No complaints in your ward</h3>
          <p>Great job! All issues are addressed or wait for sync.</p>
        </div>
      ) : complaints.map(c => {
        const st = STATUS_COLOR[c.status] || STATUS_COLOR.NEW;
        const isExp = expanded === c.id;
        return (
          <div key={c.id} style={{
            background: "#fff", borderRadius: "20px", padding: "24px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
            border: isExp ? "1.5px solid #10b981" : "1px solid #f3f4f6",
            marginBottom: "16px", transition: "all 0.2s"
          }}>
            {/* Card header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px", cursor: "pointer" }}
              onClick={() => setExpanded(isExp ? null : c.id)}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "#1d4ed8" }}>#{c.complaintNumber}</span>
                  <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: st.bg, color: st.color, display: "flex", alignItems: "center", gap: "6px" }}>
                    {st.icon} {st.label}
                  </span>
                  {c.isSlaBreached && <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 800, background: "#fee2e2", color: "#dc2626", display: "flex", alignItems: "center", gap: "4px" }}><AlertCircle size={12} /> SLA</span>}
                </div>
                <div style={{ fontSize: "12px", color: "#6b7280", display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{fontWeight: 700}}>{c.type}</span>
                  <span style={{width: 3, height: 3, background: "#d1d5db", borderRadius: "50%"}} />
                  <span>{c.citizenName}</span>
                  {c.citizenPhone && <span style={{ color: "#1d4ed8", display: "flex", alignItems: "center", gap: "4px" }}> <Phone size={12} /> {c.citizenPhone}</span>}
                </div>
              </div>
              <span style={{ background: "#f9fafb", padding: "8px", borderRadius: "50%", color: "#9ca3af" }}>{isExp ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
            </div>

            <p style={{ margin: "14px 0 16px", fontSize: "14px", color: "#374151", lineHeight: "1.5" }}>
              {isExp ? c.description : `${c.description.slice(0, 120)}${c.description.length > 120 ? "..." : ""}`}
            </p>

            {/* Location */}
            {c.locationDescription && (
              <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                <MapPin size={14} color="#10b981" /> {c.locationDescription}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", borderTop: "1px solid #f3f4f6", paddingTop: "16px" }}>
              {c.status === "NEW" && (
                <ActionBtn bg="#eff6ff" color="#1d4ed8" onClick={() => doAcknowledge(c.id)} disabled={actionLoading}>
                  <CheckCircle size={14} /> Acknowledge
                </ActionBtn>
              )}
              {["VERIFIED", "ASSIGNED", "IN_PROGRESS"].includes(c.status) && (
                <ActionBtn bg="#fff7ed" color="#c2410c" onClick={() => setProgressModal(c)}>
                  <RefreshCw size={14} /> Update Progress
                </ActionBtn>
              )}
              <ActionBtn bg="#f3f4f6" color="#4b5563" onClick={() => setCommentModal(c)}>
                <MessageSquare size={14} /> Comment
              </ActionBtn>
              {!isExp && <button onClick={() => setExpanded(c.id)} style={{background:"none", border:"none", marginLeft: "auto", color: "#6366f1", fontSize:"12px", fontWeight : 700, cursor: "pointer"}}>View Ledger Detail →</button>}
            </div>

            {/* Expanded: timeline + comments + photos */}
            {isExp && (
              <div style={{ marginTop: "24px", padding: "24px", background: "#f9fafb", borderRadius: "16px", border: "1px solid #f1f5f9" }}>

                {/* Status history */}
                {c.statusHistory?.length > 0 && (
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#111827", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}><FileText size={16} /> Status Timeline</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {c.statusHistory.map((h, i) => (
                        <div key={i} style={{ display: "flex", gap: "10px", fontSize: "12px", padding: "8px 12px", background: "#fff", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                          <span style={{ color: "#9ca3af", whiteSpace: "nowrap", fontWeight: 600 }}><CalendarIcon size={12} style={{verticalAlign:'middle', marginRight:4}} /> {new Date(h.timestamp).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          <span style={{ fontWeight: 800, color: "#1d4ed8" }}>{h.status}</span>
                          <span style={{ color: "#6b7280" }}>/ by {h.changedByName}</span>
                          {h.remarks && <span style={{ color: "#6b7280", flex: 1, textAlign: "right", fontStyle: "italic" }}>— {h.remarks}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photos */}
                {c.photos?.length > 0 && (
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#111827", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}><Camera size={16} /> On-field Evidence</div>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      {c.photos.map((p, i) => (
                        <div key={i} style={{textAlign: "center"}}>
                          <img src={p.url} alt={p.stage} style={{ width: "120px", height: "90px", objectFit: "cover", borderRadius: "12px", border: p.stage === "AFTER" ? "2px solid #10b981" : "2px solid #e2e8f0" }} />
                          <div style={{ fontSize: "10px", fontWeight: 800, color: "#9ca3af", marginTop: "4px", textTransform: "uppercase" }}>{p.stage}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments */}
                {c.comments?.length > 0 && (
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#111827", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}><MessageSquare size={16} /> Dashboard Comments</div>
                    <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
                        {c.comments.map((cm, i) => (
                          <div key={i} style={{
                            background: cm.isPublic ? "#fff" : "#fefce8",
                            borderRadius: "12px", padding: "14px",
                            border: cm.isPublic ? "1px solid #e2e8f0" : "1px dashed #f59e0b"
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                              <span style={{ fontSize: "12px", fontWeight: 800, color: "#111827", display: "flex", alignItems: "center", gap: "6px" }}>
                                <div style={{width: 22, height: 22, borderRadius: "50%", background: "#4f46e5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px"}}>{cm.authorName[0]}</div>
                                {cm.authorName} <span style={{ color: "#9ca3af", fontWeight: 500 }}>({cm.authorRole})</span>
                                {!cm.isPublic && <span style={{ background: "#fef3c7", color: "#92400e", fontSize: "9px", padding: "2px 6px", borderRadius: "4px", fontWeight: 800 }}>INTERNAL UNIT</span>}
                              </span>
                              <span style={{ fontSize: "11px", color: "#9ca3af" }}>{new Date(cm.createdAt).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: "13px", color: "#374151" }}>{cm.message}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* MODALS */}
      {progressModal && (
        <ProgressModal
          complaint={progressModal}
          onClose={() => setProgressModal(null)}
          onSubmit={(status, notes, remarks) => doProgress(progressModal.id, status, notes, remarks)}
          loading={actionLoading}
          error={actionError}
        />
      )}

      {commentModal && (
        <CommentModal
          complaint={commentModal}
          onClose={() => setCommentModal(null)}
          onSubmit={(msg, pub) => doComment(commentModal.id, msg, pub)}
          loading={actionLoading}
          error={actionError}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}

function CalendarIcon({ size, style }) { return <Clock size={size} style={style} />; }

function ActionBtn({ children, onClick, bg, color, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "8px 16px", background: bg, color, border: "none",
      borderRadius: "10px", cursor: disabled ? "not-allowed" : "pointer",
      fontSize: "12px", fontWeight: 700, fontFamily: "inherit",
      opacity: disabled ? 0.6 : 1, transition: "all 0.2s",
      display: "flex", alignItems: "center", gap: "6px"
    }}>{children}</button>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(17, 24, 39, 0.7)",
      backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: "24px"
    }}>
      <div style={{
        background: "#fff", borderRadius: "24px", padding: "32px",
        width: "100%", maxWidth: "500px", boxShadow: "0 40px 100px rgba(0,0,0,0.2)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#111827" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center" }}><AlertCircle size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: "11px", fontWeight: 800, color: "#9ca3af", marginBottom: "8px", letterSpacing: "0.5px" };

function ProgressModal({ complaint, onClose, onSubmit, loading, error }) {
  const nextStatuses = ["IN_PROGRESS", "RESOLVED"];
  const [status, setStatus]   = useState(nextStatuses[0]);
  const [notes, setNotes]     = useState("");
  const [remarks, setRemarks] = useState("");

  const inputStyle = {
    width: "100%", padding: "12px 14px", border: "1px solid #e5e7eb",
    borderRadius: "12px", fontSize: "14px", fontFamily: "inherit", outline: "none",
    boxSizing: "border-box", background: "#f9fafb"
  };

  return (
    <Modal title={`Resolution Progress — ${complaint.complaintNumber}`} onClose={onClose}>
      {error && <div style={{ background: "#fef2f2", borderRadius: "10px", padding: "12px", marginBottom: "16px", fontSize: "13px", color: "#b91c1c" }}>{error}</div>}

      <div style={{ marginBottom: "20px" }}>
        <label style={labelStyle}>UPDATE ACTION</label>
        <div style={{ display: "flex", gap: "10px" }}>
          {nextStatuses.map(s => (
            <button key={s} onClick={() => setStatus(s)} style={{
              flex: 1, padding: "12px", borderRadius: "12px",
              border: `2px solid ${status === s ? "#10b981" : "#f1f5f9"}`,
              background: status === s ? "#ecfdf5" : "#f9fafb",
              color: status === s ? "#065f46" : "#64748b",
              cursor: "pointer", fontWeight: 800, fontFamily: "inherit", fontSize: "13px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
            }}>
              {s === "IN_PROGRESS" ? <Activity size={14} /> : <CheckCircle size={14} />}
              {s === "IN_PROGRESS" ? "In Progress" : "Resolved"}
            </button>
          ))}
        </div>
      </div>

      {status === "RESOLVED" && (
        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>RESOLUTION LOG *</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            placeholder="Document the resolution for citizen records..."
            style={{ ...inputStyle, resize: "none" }} />
        </div>
      )}

      <div style={{ marginBottom: "24px" }}>
        <label style={labelStyle}>INTERNAL REMARKS (OPTIONAL)</label>
        <input value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Notes for administrative review..."
          style={inputStyle} />
      </div>

      <button
        onClick={() => onSubmit(status, notes, remarks)}
        disabled={loading || (status === "RESOLVED" && !notes.trim())}
        style={{ width: "100%", padding: "16px", background: "#f59e0b", color: "#fff", border: "none", borderRadius: "14px", cursor: "pointer", fontWeight: 800, fontFamily: "inherit", fontSize: "15px" }}>
        {loading ? "Registering Update..." : "Confirm Progress Update"}
      </button>
    </Modal>
  );
}

function CommentModal({ complaint, onClose, onSubmit, loading, error }) {
  const [message, setMessage]   = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const inputStyle = {
    width: "100%", padding: "12px 14px", border: "1px solid #e5e7eb",
    borderRadius: "12px", fontSize: "14px", fontFamily: "inherit", outline: "none",
    boxSizing: "border-box", background: "#f9fafb", resize: "none"
  };

  return (
    <Modal title={`Internal Dispatch — ${complaint.complaintNumber}`} onClose={onClose}>
      {error && <div style={{ background: "#fef2f2", borderRadius: "10px", padding: "12px", marginBottom: "16px", fontSize: "13px", color: "#b91c1c" }}>{error}</div>}
      <label style={labelStyle}>MESSAGE BODY</label>
      <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
        placeholder="Add context to the complaint ledger..."
        style={{ ...inputStyle, marginBottom: "16px" }} />
      
      <div style={{ padding: "16px", background: "#f9fafb", borderRadius: "14px", marginBottom: "24px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#111827", cursor: "pointer", fontWeight: 700 }}>
          <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} style={{width: 18, height: 18}} />
          Dispatch as Public Notice
        </label>
        <p style={{ margin: "6px 0 0 28px", fontSize: "12px", color: "#6b7280" }}>Public notices are visible to citizens tracking their complaint status.</p>
      </div>

      <button onClick={() => onSubmit(message, isPublic)} disabled={loading || !message.trim()}
        style={{ width: "100%", padding: "16px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: "14px", cursor: "pointer", fontWeight: 800, fontFamily: "inherit", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
        <MessageSquare size={18} /> {loading ? "Dispatching..." : "Post Collaboration Note"}
      </button>
    </Modal>
  );
}
