import { useState, useEffect } from "react";
import {
  wardListComplaints, wardAcknowledge, wardUpdateProgress,
  wardComment, mapComplaint, getUser
} from "../utils/api";

const STATUS_COLOR = {
  NEW:            { bg: "#dbeafe", color: "#1e40af", label: "New" },
  PENDING_REVIEW: { bg: "#fef3c7", color: "#92400e", label: "Pending Review" },
  VERIFIED:       { bg: "#d1fae5", color: "#065f46", label: "Verified" },
  ASSIGNED:       { bg: "#ede9fe", color: "#5b21b6", label: "Assigned" },
  IN_PROGRESS:    { bg: "#ffedd5", color: "#92400e", label: "In Progress" },
  RESOLVED:       { bg: "#d1fae5", color: "#065f46", label: "Resolved" },
  CLOSED:         { bg: "#f3f4f6", color: "#374151", label: "Closed" },
  REJECTED:       { bg: "#fee2e2", color: "#991b1b", label: "Rejected" },
  ESCALATED:      { bg: "#fee2e2", color: "#7f1d1d", label: "🚨 Escalated" },
};

export default function WardDashboard({ navigate }) {
  const user = getUser();
  const wardId = user?.wardId;

  const [complaints, setComplaints]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [expanded, setExpanded]       = useState(null);

  // Modal states
  const [progressModal, setProgressModal] = useState(null);
  const [commentModal, setCommentModal]   = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError]     = useState(null);

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = async () => {
    if (!wardId) return;
    setLoading(true);
    try {
      const data = await wardListComplaints(wardId, filterStatus || undefined, 0, 50);
      const items = Array.isArray(data) ? data : (data?.content ?? []);
      setComplaints(items.map(mapComplaint));
    } catch (e) {
      console.error("Ward load error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterStatus, wardId]);

  // ── Actions ───────────────────────────────────────────────────────────────
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
      setProgressModal(null);
      load();
    } catch (e) { setActionError(e.message); }
    finally { setActionLoading(false); }
  };

  const doComment = async (id, message, isPublic) => {
    setActionLoading(true); setActionError(null);
    try {
      await wardComment(id, message, isPublic);
      setCommentModal(null);
      load();
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
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: 800, color: "#111827" }}>
            🟢 Ward Member Dashboard
          </h1>
          <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
            <strong>{user?.fullName}</strong> · Ward: <strong>{user?.wardName || wardId}</strong>
          </p>
        </div>
        <button onClick={() => navigate("home")}
          style={{ padding: "8px 16px", background: "#f3f4f6", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}>
          ← Citizen View
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "New",         v: counts.NEW,         bg: "#dbeafe", color: "#1d4ed8" },
          { label: "Pending",     v: counts.PENDING,     bg: "#fef3c7", color: "#92400e" },
          { label: "In Progress", v: counts.IN_PROGRESS, bg: "#ffedd5", color: "#c2410c" },
          { label: "Resolved",    v: counts.RESOLVED,    bg: "#d1fae5", color: "#065f46" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: "14px", padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "26px", fontWeight: 800, color: s.color }}>{s.v}</div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "13px", fontFamily: "inherit", background: "#fff" }}>
          <option value="">All Statuses</option>
          {Object.entries(STATUS_COLOR).map(([v, c]) => (
            <option key={v} value={v}>{c.label}</option>
          ))}
        </select>
        <button onClick={load} style={{ padding: "9px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontFamily: "inherit", color: "#1d4ed8", fontWeight: 600 }}>
          🔄 Refresh
        </button>
        <span style={{ marginLeft: "auto", fontSize: "13px", color: "#9ca3af" }}>
          {complaints.length} complaint{complaints.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
          Loading ward complaints...
        </div>
      ) : complaints.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>📋</div>
          No complaints in your ward
        </div>
      ) : complaints.map(c => {
        const st = STATUS_COLOR[c.status] || STATUS_COLOR.NEW;
        const isExp = expanded === c.id;
        return (
          <div key={c.id} style={{
            background: "#fff", borderRadius: "16px", padding: "20px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
            border: isExp ? "1.5px solid #bfdbfe" : "1px solid #f3f4f6",
            marginBottom: "12px", transition: "all 0.2s"
          }}>
            {/* Card header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px", cursor: "pointer" }}
              onClick={() => setExpanded(isExp ? null : c.id)}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#1d4ed8" }}>#{c.complaintNumber}</span>
                  <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: st.bg, color: st.color }}>{st.label}</span>
                  {c.isSlaBreached && <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: "#fee2e2", color: "#dc2626" }}>🚨 SLA</span>}
                </div>
                <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "3px" }}>
                  {c.type} · {c.citizenName}
                  {c.citizenPhone && <span style={{ color: "#1d4ed8" }}> · 📞 {c.citizenPhone}</span>}
                </div>
              </div>
              <span style={{ fontSize: "18px", color: "#9ca3af" }}>{isExp ? "▲" : "▼"}</span>
            </div>

            <p style={{ margin: "10px 0 12px", fontSize: "13px", color: "#374151" }}>
              {c.description.slice(0, 100)}{c.description.length > 100 ? "..." : ""}
            </p>

            {/* Location */}
            {c.locationDescription && (
              <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "10px" }}>
                📍 {c.locationDescription}
                {c.latitude && <span> ({c.latitude?.toFixed(4)}, {c.longitude?.toFixed(4)})</span>}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {c.status === "NEW" && (
                <ActionBtn bg="#dbeafe" color="#1d4ed8" onClick={() => doAcknowledge(c.id)} disabled={actionLoading}>
                  👋 Acknowledge
                </ActionBtn>
              )}
              {["VERIFIED", "ASSIGNED", "IN_PROGRESS"].includes(c.status) && (
                <ActionBtn bg="#ffedd5" color="#c2410c" onClick={() => setProgressModal(c)}>
                  🔄 Update Progress
                </ActionBtn>
              )}
              <ActionBtn bg="#f3f4f6" color="#374151" onClick={() => setCommentModal(c)}>
                💬 Comment
              </ActionBtn>
            </div>

            {/* Expanded: timeline + comments + photos */}
            {isExp && (
              <div style={{ marginTop: "16px", borderTop: "1px solid #f3f4f6", paddingTop: "16px" }}>

                {/* Status history */}
                {c.statusHistory?.length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>📋 Status Timeline</div>
                    {c.statusHistory.map((h, i) => (
                      <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "6px", fontSize: "12px" }}>
                        <span style={{ color: "#9ca3af", whiteSpace: "nowrap" }}>{new Date(h.timestamp).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        <span style={{ fontWeight: 600, color: "#111827" }}>{h.status}</span>
                        <span style={{ color: "#6b7280" }}>by {h.changedByName}</span>
                        {h.remarks && <span style={{ color: "#9ca3af" }}>— {h.remarks}</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Photos */}
                {c.photos?.length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>📷 Photos</div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {c.photos.map((p, i) => (
                        <div key={i}>
                          <img src={p.url} alt={p.stage} style={{ width: "100px", height: "80px", objectFit: "cover", borderRadius: "8px", border: p.stage === "AFTER" ? "2px solid #6ee7b7" : "2px solid #e5e7eb" }} />
                          <div style={{ fontSize: "10px", textAlign: "center", color: "#9ca3af" }}>{p.stage}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments — all (internal + public) for ward member */}
                {c.comments?.length > 0 && (
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>💬 Comments</div>
                    {c.comments.map((cm, i) => (
                      <div key={i} style={{
                        background: cm.isPublic ? "#f0f9ff" : "#f9fafb",
                        borderRadius: "8px", padding: "10px 12px", marginBottom: "6px",
                        border: cm.isPublic ? "1px solid #bae6fd" : "1px dashed #e5e7eb"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#374151" }}>
                            {cm.authorName} <span style={{ color: "#9ca3af", fontWeight: 400 }}>({cm.authorRole})</span>
                            {!cm.isPublic && <span style={{ background: "#fef3c7", color: "#92400e", fontSize: "10px", padding: "1px 6px", borderRadius: "4px", marginLeft: "6px" }}>Internal</span>}
                          </span>
                          <span style={{ fontSize: "10px", color: "#9ca3af" }}>{new Date(cm.createdAt).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: "12px", color: "#374151" }}>{cm.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* ── PROGRESS MODAL ── */}
      {progressModal && (
        <ProgressModal
          complaint={progressModal}
          onClose={() => setProgressModal(null)}
          onSubmit={(status, notes, remarks) => doProgress(progressModal.id, status, notes, remarks)}
          loading={actionLoading}
          error={actionError}
        />
      )}

      {/* ── COMMENT MODAL ── */}
      {commentModal && (
        <CommentModal
          complaint={commentModal}
          onClose={() => setCommentModal(null)}
          onSubmit={(msg, pub) => doComment(commentModal.id, msg, pub)}
          loading={actionLoading}
          error={actionError}
        />
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ActionBtn({ children, onClick, bg, color, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "6px 14px", background: bg, color, border: "none",
      borderRadius: "8px", cursor: disabled ? "not-allowed" : "pointer",
      fontSize: "12px", fontWeight: 600, fontFamily: "inherit",
      opacity: disabled ? 0.6 : 1
    }}>{children}</button>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: "24px"
    }}>
      <div style={{
        background: "#fff", borderRadius: "20px", padding: "32px",
        width: "100%", maxWidth: "480px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.3)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#111827" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#9ca3af" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ProgressModal({ complaint, onClose, onSubmit, loading, error }) {
  const nextStatuses = ["IN_PROGRESS", "RESOLVED"];

  const [status, setStatus]   = useState(nextStatuses[0]);
  const [notes, setNotes]     = useState("");
  const [remarks, setRemarks] = useState("");

  return (
    <Modal title={`Update Progress — ${complaint.complaintNumber}`} onClose={onClose}>
      {error && <div style={{ background: "#fee2e2", borderRadius: "8px", padding: "10px", marginBottom: "16px", fontSize: "13px", color: "#dc2626" }}>{error}</div>}

      <div style={{ marginBottom: "14px" }}>
        <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>New Status</label>
        <div style={{ display: "flex", gap: "10px" }}>
          {nextStatuses.map(s => (
            <button key={s} onClick={() => setStatus(s)} style={{
              flex: 1, padding: "10px", borderRadius: "10px",
              border: `2px solid ${status === s ? "#f59e0b" : "#e5e7eb"}`,
              background: status === s ? "#fef3c7" : "#fff",
              color: status === s ? "#92400e" : "#6b7280",
              cursor: "pointer", fontWeight: 700, fontFamily: "inherit", fontSize: "13px"
            }}>{s === "IN_PROGRESS" ? "🔄 In Progress" : "✅ Resolved"}</button>
          ))}
        </div>
      </div>

      {status === "RESOLVED" && (
        <div style={{ marginBottom: "14px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Resolution Notes <span style={{ color: "#ef4444" }}>*</span></label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            placeholder="Describe what was done to resolve the issue..."
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "13px", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", outline: "none" }} />
        </div>
      )}

      <div style={{ marginBottom: "16px" }}>
        <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Remarks (optional)</label>
        <input value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Any additional remarks..."
          style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "13px", fontFamily: "inherit", boxSizing: "border-box", outline: "none" }} />
      </div>

      <button
        onClick={() => onSubmit(status, notes, remarks)}
        disabled={loading || (status === "RESOLVED" && !notes.trim())}
        style={{ width: "100%", padding: "12px", background: "#f59e0b", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontFamily: "inherit", fontSize: "14px" }}>
        {loading ? "⏳ Updating..." : "Update Status"}
      </button>
    </Modal>
  );
}

function CommentModal({ complaint, onClose, onSubmit, loading, error }) {
  const [message, setMessage]   = useState("");
  const [isPublic, setIsPublic] = useState(true);
  return (
    <Modal title={`Comment — ${complaint.complaintNumber}`} onClose={onClose}>
      {error && <div style={{ background: "#fee2e2", borderRadius: "8px", padding: "10px", marginBottom: "16px", fontSize: "13px", color: "#dc2626" }}>{error}</div>}
      <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
        placeholder="Write your comment..."
        style={{ width: "100%", padding: "11px 14px", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", marginBottom: "12px", outline: "none" }} />
      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#374151", marginBottom: "16px", cursor: "pointer" }}>
        <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
        Public (citizen can see this comment)
      </label>
      <button onClick={() => onSubmit(message, isPublic)} disabled={loading || !message.trim()}
        style={{ width: "100%", padding: "12px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontFamily: "inherit", fontSize: "14px" }}>
        {loading ? "⏳ Posting..." : "Post Comment"}
      </button>
    </Modal>
  );
}
