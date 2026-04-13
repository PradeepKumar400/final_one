import { useState, useEffect } from "react";
import {
  adminListComplaints, adminVerify, adminAssign,
  adminEscalate, adminComment, adminAnalytics, registerUser, mapComplaint, getUser
} from "../utils/api";

const STATUS_COLOR = {
  NEW:            { bg: "#dbeafe", color: "#1e40af", label: "New" },
  PENDING_REVIEW: { bg: "#fef3c7", color: "#92400e", label: "Pending Review" },
  VERIFIED:       { bg: "#d1fae5", color: "#065f46", label: "Verified" },
  REJECTED:       { bg: "#fee2e2", color: "#991b1b", label: "Rejected" },
  ASSIGNED:       { bg: "#ede9fe", color: "#5b21b6", label: "Assigned" },
  IN_PROGRESS:    { bg: "#ffedd5", color: "#92400e", label: "In Progress" },
  RESOLVED:       { bg: "#d1fae5", color: "#065f46", label: "Resolved" },
  CLOSED:         { bg: "#f3f4f6", color: "#374151", label: "Closed" },
  ESCALATED:      { bg: "#fee2e2", color: "#7f1d1d", label: "🚨 Escalated" },
};

const PRIORITY_COLOR = {
  URGENT: { bg: "#fee2e2", color: "#dc2626" },
  NORMAL: { bg: "#dbeafe", color: "#1d4ed8" },
  LOW:    { bg: "#f3f4f6", color: "#6b7280" },
};

export default function AdminDashboard({ navigate }) {
  const user = getUser();
  const [complaints, setComplaints]   = useState([]);
  const [analytics, setAnalytics]     = useState(null);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState("complaints");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  // ── Action modal state ───────────────────────────────────────────────────
  const [verifyModal, setVerifyModal] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [progressModal, setProgressModal] = useState(null);
  const [commentModal, setCommentModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError]     = useState(null);

  // ── Registration State (for Manage Staff tab) ────────────────────────────
  const [regForm, setRegForm] = useState({
    username: "", password: "", fullName: "", phone: "", role: "WARD_MEMBER", wardId: "", wardName: ""
  });
  const [regStatus, setRegStatus] = useState({ loading: false, error: null, success: null });

  // ── Load data ────────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus)   params.status   = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      params.size = 50;
      const data = await adminListComplaints(params);
      const items = Array.isArray(data) ? data : (data?.content ?? []);
      setComplaints(items.map(mapComplaint));
    } catch (e) {
      console.error("Failed to load complaints", e);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await adminAnalytics();
      setAnalytics(data);
    } catch (e) { console.error("Analytics error", e); }
  };

  useEffect(() => { load(); }, [filterStatus, filterPriority]);
  useEffect(() => { if (activeTab === "analytics") loadAnalytics(); }, [activeTab]);

  // ── Staff Registration Handler ───────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegStatus({ loading: true, error: null, success: null });
    try {
      await registerUser(regForm);
      setRegStatus({ loading: false, error: null, success: "Staff registered successfully!" });
      setRegForm({ username: "", password: "", fullName: "", phone: "", role: "WARD_MEMBER", wardId: "", wardName: "" });
    } catch (err) {
      setRegStatus({ loading: false, error: err.message, success: null });
    }
  };

  // ── Actions ──────────────────────────────────────────────────────────────
  const doVerify = async (id, approved, reason, priority) => {
    setActionLoading(true); setActionError(null);
    try {
      await adminVerify(id, { approved, rejectionReason: reason, priority });
      setVerifyModal(null);
      load();
    } catch (e) { setActionError(e.message); }
    finally { setActionLoading(false); }
  };

  const doAssign = async (id, technicianName) => {
    setActionLoading(true); setActionError(null);
    try {
      await adminAssign(id, {
        technicianId: "00000000-0000-0000-0000-000000000001",
        technicianName
      });
      setAssignModal(null);
      load();
    } catch (e) { setActionError(e.message); }
    finally { setActionLoading(false); }
  };

  const doProgress = async (id, status, notes, remarks) => {
    setActionLoading(true); setActionError(null);
    try {
      // Admins use the progress endpoint to resolve or update
      const { wardUpdateProgress } = await import("../utils/api");
      await wardUpdateProgress(id, status, notes, remarks);
      setProgressModal(null);
      load();
    } catch (e) { setActionError(e.message); }
    finally { setActionLoading(false); }
  };

  const doEscalate = async (id, reason) => {
    setActionLoading(true); setActionError(null);
    try {
      await adminEscalate(id, reason);
      load();
    } catch (e) { setActionError(e.message); }
    finally { setActionLoading(false); }
  };

  const doComment = async (id, message, isPublic) => {
    setActionLoading(true); setActionError(null);
    try {
      await adminComment(id, message, isPublic);
      setCommentModal(null);
      load();
    } catch (e) { setActionError(e.message); }
    finally { setActionLoading(false); }
  };

  const cardStyle = {
    background: "#fff", borderRadius: "16px", padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: "12px",
    cursor: "pointer", border: "1px solid #f3f4f6", transition: "all 0.2s"
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "26px", fontWeight: 800, color: "#111827" }}>
            🔴 Admin Dashboard
          </h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
            Welcome, <strong>{user?.fullName || user?.username}</strong>
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate("home")}
            style={{ padding: "8px 16px", background: "#f3f4f6", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}
          >
            ← Citizen View
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", borderBottom: "1px solid #e5e7eb" }}>
        {[
          ["complaints", "📋 Complaints"],
          ["analytics", "📊 Analytics"],
          ["register", "👤 Manage Staff"]
        ].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: "10px 20px", background: "none", border: "none",
            cursor: "pointer", fontSize: "14px", fontWeight: activeTab === tab ? 700 : 400,
            color: activeTab === tab ? "#1d4ed8" : "#6b7280",
            borderBottom: activeTab === tab ? "2px solid #1d4ed8" : "2px solid transparent",
            fontFamily: "inherit"
          }}>{label}</button>
        ))}
      </div>

      {/* ── COMPLAINTS TAB ── */}
      {activeTab === "complaints" && (
        <>
          {/* Filters */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "13px", fontFamily: "inherit", background: "#fff" }}>
              <option value="">All Statuses</option>
              {Object.entries(STATUS_COLOR).map(([v, c]) => (
                <option key={v} value={v}>{c.label}</option>
              ))}
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
              style={{ padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "13px", fontFamily: "inherit", background: "#fff" }}>
              <option value="">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="NORMAL">Normal</option>
              <option value="LOW">Low</option>
            </select>
            <button onClick={load}
              style={{ padding: "9px 16px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontFamily: "inherit", color: "#1d4ed8", fontWeight: 600 }}>
              🔄 Refresh
            </button>
            <span style={{ marginLeft: "auto", fontSize: "13px", color: "#9ca3af", alignSelf: "center" }}>
              {complaints.length} complaint{complaints.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
              Loading complaints...
            </div>
          ) : complaints.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>📋</div>
              No complaints found
            </div>
          ) : complaints.map(c => {
            const st = STATUS_COLOR[c.status] || STATUS_COLOR.NEW;
            const pri = PRIORITY_COLOR[c.priority] || PRIORITY_COLOR.NORMAL;
            return (
              <div key={c.id} style={cardStyle}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.07)"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#1d4ed8" }}>#{c.complaintNumber}</span>
                      <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, ...st }}>{st.label}</span>
                      <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, ...pri }}>{c.priority}</span>
                      {c.isSlaBreached && <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: "#fee2e2", color: "#dc2626" }}>🚨 SLA</span>}
                    </div>
                    <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "3px" }}>
                      {c.type} · {c.wardName} · {c.citizenName}
                      {c.citizenPhone && <> · 📞 {c.citizenPhone}</>}
                    </div>
                  </div>
                  <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                    {new Date(c.createdAt).toLocaleString("en-IN")}
                  </div>
                </div>

                <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#374151" }}>
                  {c.description.slice(0, 120)}{c.description.length > 120 ? "..." : ""}
                </p>

                {c.rejectionReason && (
                  <div style={{ background: "#fee2e2", borderRadius: "8px", padding: "8px 12px", marginBottom: "12px", fontSize: "12px", color: "#991b1b" }}>
                    ❌ Rejected: {c.rejectionReason}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {(c.status === "NEW" || c.status === "PENDING_REVIEW") && (
                    <ActionBtn color="#1d4ed8" bg="#dbeafe" onClick={() => setVerifyModal(c)}>
                      ✅ Verify / Reject
                    </ActionBtn>
                  )}
                  {c.status === "VERIFIED" && (
                    <ActionBtn color="#7c3aed" bg="#ede9fe" onClick={() => setAssignModal(c)}>
                      👷 Assign Technician
                    </ActionBtn>
                  )}
                  {["ASSIGNED", "IN_PROGRESS"].includes(c.status) && (
                    <ActionBtn color="#c2410c" bg="#ffedd5" onClick={() => setProgressModal(c)}>
                      🔄 Update Progress
                    </ActionBtn>
                  )}
                  {!["REJECTED","CLOSED","ESCALATED"].includes(c.status) && (
                    <ActionBtn color="#dc2626" bg="#fee2e2"
                      onClick={() => { const r = prompt("Escalation reason?"); if (r) doEscalate(c.id, r); }}>
                      🚨 Escalate
                    </ActionBtn>
                  )}
                  <ActionBtn color="#374151" bg="#f3f4f6" onClick={() => setCommentModal(c)}>
                    💬 Comment
                  </ActionBtn>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* ── ANALYTICS TAB ── */}
      {activeTab === "analytics" && analytics && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
          {[
            { label: "Total Complaints",   value: analytics.totalComplaints,   color: "#1d4ed8", bg: "#dbeafe" },
            { label: "Open",               value: analytics.openComplaints,     color: "#d97706", bg: "#fef3c7" },
            { label: "Resolved",           value: analytics.resolvedComplaints, color: "#059669", bg: "#d1fae5" },
            { label: "SLA Breached",       value: analytics.slaBreachedCount,   color: "#dc2626", bg: "#fee2e2" },
            { label: "Avg Resolution (hrs)",value: analytics.avgResolutionHours?.toFixed(1), color: "#7c3aed", bg: "#ede9fe" },
            { label: "Resolution Rate",    value: `${analytics.resolutionRate?.toFixed(1)}%`, color: "#065f46", bg: "#d1fae5" },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: "16px", padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "12px", color: "#374151", fontWeight: 600, marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}

          {/* By Status */}
          {analytics.byStatus && (
            <div style={{ gridColumn: "1/-1", background: "#fff", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 700, color: "#111827" }}>By Status</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {Object.entries(analytics.byStatus).map(([k, v]) => {
                  const cfg = STATUS_COLOR[k] || { bg: "#f3f4f6", color: "#374151", label: k };
                  return (
                    <div key={k} style={{ ...cfg, padding: "8px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 600 }}>
                      {cfg.label}: <strong>{v}</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── REGISTER STAFF TAB ── */}
      {activeTab === "register" && (
        <div style={{ background: "#fff", borderRadius: "20px", padding: "32px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", maxWidth: "600px" }}>
          <h2 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: 800, color: "#111827" }}>Register New Staff</h2>
          <p style={{ margin: "0 0 24px", color: "#6b7280", fontSize: "14px" }}>Create accounts for Ward Members or additional Administrators.</p>

          {regStatus.error && <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "10px", padding: "12px", marginBottom: "20px", fontSize: "13px", color: "#dc2626" }}>⚠️ {regStatus.error}</div>}
          {regStatus.success && <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: "10px", padding: "12px", marginBottom: "20px", fontSize: "13px", color: "#065f46" }}>✅ {regStatus.success}</div>}

          <form onSubmit={handleRegister}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Username *</label>
                <input required value={regForm.username} onChange={e => setRegForm({...regForm, username: e.target.value})} placeholder="e.g. ward01_member" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Password *</label>
                <input required type="password" value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} placeholder="••••••••" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Full Name *</label>
              <input required value={regForm.fullName} onChange={e => setRegForm({...regForm, fullName: e.target.value})} placeholder="e.g. Ramesh Kumar" style={inputStyle} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Phone Number *</label>
                <input required value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} placeholder="+91 98765 43210" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>System Role *</label>
                <select value={regForm.role} onChange={e => setRegForm({...regForm, role: e.target.value})} style={inputStyle}>
                  <option value="WARD_MEMBER">Ward Member</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>

            {regForm.role === "WARD_MEMBER" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Ward ID *</label>
                  <input required value={regForm.wardId} onChange={e => setRegForm({...regForm, wardId: e.target.value})} placeholder="e.g. WARD-01" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Ward Name</label>
                  <input value={regForm.wardName} onChange={e => setRegForm({...regForm, wardName: e.target.value})} placeholder="e.g. Gandhi Nagar" style={inputStyle} />
                </div>
              </div>
            )}

            <button disabled={regStatus.loading} style={{ width: "100%", padding: "14px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              {regStatus.loading ? "⏳ Creating Account..." : "➕ Create Staff Account"}
            </button>
          </form>
        </div>
      )}

      {/* ── MODALS ── */}
      {verifyModal && <VerifyModal complaint={verifyModal} onClose={() => setVerifyModal(null)}
        onSubmit={(approved, reason, priority) => doVerify(verifyModal.id, approved, reason, priority)}
        loading={actionLoading} error={actionError} />}

      {/* ── ASSIGN MODAL ── */}
      {assignModal && <AssignModal complaint={assignModal} onClose={() => setAssignModal(null)}
        onSubmit={(name) => doAssign(assignModal.id, name)}
        loading={actionLoading} error={actionError} />}

      {/* ── COMMENT MODAL ── */}
      {commentModal && <CommentModal complaint={commentModal} onClose={() => setCommentModal(null)}
        onSubmit={(msg, pub) => doComment(commentModal.id, msg, pub)}
        loading={actionLoading} error={actionError} />}

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
    </div>
  );
}

// ── NEW PROGRESS MODAL COMPONENT ──
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
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Resolution Notes *</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Describe the resolution..."
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "13px", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", outline: "none" }} />
        </div>
      )}
      <div style={{ marginBottom: "16px" }}>
        <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Remarks (optional)</label>
        <input value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Additional remarks..."
          style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "13px", fontFamily: "inherit", boxSizing: "border-box", outline: "none" }} />
      </div>
      <button onClick={() => onSubmit(status, notes, remarks)} disabled={loading || (status === "RESOLVED" && !notes.trim())}
        style={{ width: "100%", padding: "12px", background: "#f59e0b", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontFamily: "inherit", fontSize: "14px" }}>
        {loading ? "⏳ Updating..." : "Update Status"}
      </button>
    </Modal>
  );
}

// ── Styles & Sub-components ───────────────────────────────────────────────────

const inputStyle = {
  width: "100%", padding: "11px 14px", border: "1px solid #d1d5db",
  borderRadius: "10px", fontSize: "14px", outline: "none", fontFamily: "inherit",
  color: "#111827", boxSizing: "border-box"
};

function ActionBtn({ children, onClick, color, bg }) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 14px", background: bg, color, border: "none",
      borderRadius: "8px", cursor: "pointer", fontSize: "12px",
      fontWeight: 600, fontFamily: "inherit"
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
        width: "100%", maxWidth: "480px", boxShadow: "0 24px 64px rgba(0,0,0,0.3)"
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

function VerifyModal({ complaint, onClose, onSubmit, loading, error }) {
  const [approved, setApproved]   = useState(true);
  const [reason, setReason]       = useState("");
  const [priority, setPriority]   = useState("NORMAL");
  return (
    <Modal title={`Verify — ${complaint.complaintNumber}`} onClose={onClose}>
      {error && <div style={{ background: "#fee2e2", borderRadius: "8px", padding: "10px", marginBottom: "16px", fontSize: "13px", color: "#dc2626" }}>{error}</div>}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        {[true, false].map(v => (
          <button key={String(v)} onClick={() => setApproved(v)} style={{
            flex: 1, padding: "10px", borderRadius: "10px", border: "2px solid",
            borderColor: approved === v ? (v ? "#10b981" : "#ef4444") : "#e5e7eb",
            background: approved === v ? (v ? "#d1fae5" : "#fee2e2") : "#fff",
            color: approved === v ? (v ? "#065f46" : "#991b1b") : "#6b7280",
            cursor: "pointer", fontWeight: 700, fontFamily: "inherit", fontSize: "13px"
          }}>{v ? "✅ Approve" : "❌ Reject"}</button>
        ))}
      </div>
      {approved && (
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Priority</label>
          <select value={priority} onChange={e => setPriority(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "13px", fontFamily: "inherit" }}>
            <option value="URGENT">🔴 URGENT (24h)</option>
            <option value="NORMAL">🔵 NORMAL (72h)</option>
            <option value="LOW">⚪ LOW (7 days)</option>
          </select>
        </div>
      )}
      {!approved && (
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Rejection Reason <span style={{ color: "#ef4444" }}>*</span></label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="Explain why this complaint is rejected..."
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "13px", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }} />
        </div>
      )}
      <button onClick={() => onSubmit(approved, reason, priority)} disabled={loading || (!approved && !reason.trim())}
        style={{ width: "100%", padding: "12px", background: approved ? "#10b981" : "#ef4444", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontFamily: "inherit", fontSize: "14px" }}>
        {loading ? "⏳ Saving..." : (approved ? "Approve & Verify" : "Reject Complaint")}
      </button>
    </Modal>
  );
}

function AssignModal({ complaint, onClose, onSubmit, loading, error }) {
  const [name, setName] = useState("");
  return (
    <Modal title={`Assign Technician — ${complaint.complaintNumber}`} onClose={onClose}>
      {error && <div style={{ background: "#fee2e2", borderRadius: "8px", padding: "10px", marginBottom: "16px", fontSize: "13px", color: "#dc2626" }}>{error}</div>}
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Technician name..."
        style={{ width: "100%", padding: "11px 14px", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", fontFamily: "inherit", marginBottom: "16px", boxSizing: "border-box", outline: "none" }} />
      <button onClick={() => onSubmit(name)} disabled={loading || !name.trim()}
        style={{ width: "100%", padding: "12px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontFamily: "inherit", fontSize: "14px" }}>
        {loading ? "⏳ Assigning..." : "Assign Technician"}
      </button>
    </Modal>
  );
}

function CommentModal({ complaint, onClose, onSubmit, loading, error }) {
  const [message, setMessage]   = useState("");
  const [isPublic, setIsPublic] = useState(false);
  return (
    <Modal title={`Comment — ${complaint.complaintNumber}`} onClose={onClose}>
      {error && <div style={{ background: "#fee2e2", borderRadius: "8px", padding: "10px", marginBottom: "16px", fontSize: "13px", color: "#dc2626" }}>{error}</div>}
      <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="Write your comment..."
        style={{ width: "100%", padding: "11px 14px", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", marginBottom: "12px", outline: "none" }} />
      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#374151", marginBottom: "16px", cursor: "pointer" }}>
        <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
        Public (citizen can see this)
      </label>
      <button onClick={() => onSubmit(message, isPublic)} disabled={loading || !message.trim()}
        style={{ width: "100%", padding: "12px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontFamily: "inherit", fontSize: "14px" }}>
        {loading ? "⏳ Posting..." : "Post Comment"}
      </button>
    </Modal>
  );
}
