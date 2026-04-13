import { useState } from "react";
import { addComment as apiAddComment } from "../utils/api";
import { statusConfig, typeConfig, priorityConfig } from "../data/complaints";

const STATUS_STEPS = [
  { key: "NEW", label: "Submitted" },
  { key: "PENDING_REVIEW", label: "Acknowledged" },
  { key: "VERIFIED", label: "Verified" },
  { key: "ASSIGNED", label: "Assigned" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "RESOLVED", label: "Resolved" },
  { key: "CLOSED", label: "Closed" }
];

function getStepIndex(status) {
  const map = { NEW: 0, PENDING_REVIEW: 1, VERIFIED: 2, ASSIGNED: 3, IN_PROGRESS: 4, RESOLVED: 5, CLOSED: 6, REJECTED: -1, ESCALATED: 4 };
  return map[status] ?? 0;
}

export default function ComplaintDetailPage({ complaint, navigate }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [rated, setRated] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(complaint?.comments || []);

  if (!complaint) {
    return (
      <div style={{ textAlign: "center", padding: "80px" }}>
        <div style={{ fontSize: "48px" }}>📋</div>
        <p style={{ color: "#6b7280" }}>No complaint selected</p>
        <button onClick={() => navigate("complaints")} style={{ padding: "12px 24px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontFamily: "inherit" }}>
          Back to Complaints
        </button>
      </div>
    );
  }

  const type = typeConfig[complaint.type] || typeConfig.OTHER;
  const status = statusConfig[complaint.status] || statusConfig.NEW;
  const priority = priorityConfig[complaint.priority] || priorityConfig.NORMAL;
  const stepIdx = getStepIndex(complaint.status);
  const beforePhotos = complaint.photos?.filter(p => p.stage === "BEFORE") || [];
  const afterPhotos = complaint.photos?.filter(p => p.stage === "AFTER") || [];

  const handleRate = () => {
    if (rating > 0) setRated(true);
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    const newComment = {
      message: comment,
      isPublic: true,
      authorName: "Senthil Kumar",
      authorRole: "CITIZEN",
      createdAt: new Date().toISOString()
    };
    // Optimistic update
    setComments(prev => [...prev, newComment]);
    setComment("");
    // Try to persist to backend (ignore errors — user sees optimistic update)
    if (complaint?.id) {
      apiAddComment(complaint.id, comment).catch(() => {/* offline — already shown locally */});
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 32px" }}>
      {/* Back */}
      <button onClick={() => navigate("complaints")} style={{ background: "none", border: "none", cursor: "pointer", color: "#1d4ed8", fontSize: "14px", fontFamily: "inherit", marginBottom: "20px", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
        ← Back to Complaints
      </button>

      {/* Header card */}
      <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: "20px" }}>
        {complaint.isSlaBreached && (
          <div style={{ background: "#fee2e2", color: "#dc2626", fontSize: "13px", fontWeight: 600, padding: "8px 14px", borderRadius: "8px", marginBottom: "16px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            🚨 SLA Deadline Breached — Immediate action required
          </div>
        )}

        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "20px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: type.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", flexShrink: 0 }}>
            {type.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
              <div>
                <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 800, color: "#111827" }}>{type.label} Complaint</h1>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "13px", color: "#1d4ed8", fontWeight: 600 }}>{complaint.complaintNumber}</span>
                  <span style={{ fontSize: "13px", color: "#9ca3af" }}>·</span>
                  <span style={{ fontSize: "13px", color: "#374151" }}>{complaint.wardName}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ padding: "5px 12px", borderRadius: "20px", background: status.bg, color: status.color, fontSize: "12px", fontWeight: 700 }}>
                  {status.label}
                </span>
                <span style={{ padding: "5px 12px", borderRadius: "20px", background: priority.bg, color: priority.color, fontSize: "12px", fontWeight: 700 }}>
                  {priority.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p style={{ margin: "0 0 20px", fontSize: "15px", color: "#374151", lineHeight: "1.6" }}>{complaint.description}</p>

        {/* Meta */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
          {[
            { label: "Submitted by", value: complaint.citizenName },
            { label: "Phone", value: complaint.citizenPhone },
            { label: "Location", value: complaint.locationDescription || "Not specified" },
            { label: "Submitted on", value: new Date(complaint.createdAt).toLocaleString("en-IN") },
            { label: "SLA Deadline", value: new Date(complaint.slaDeadline).toLocaleString("en-IN") },
            complaint.assignedToName && { label: "Assigned to", value: complaint.assignedToName }
          ].filter(Boolean).map(item => (
            <div key={item.label} style={{ background: "#f9fafb", borderRadius: "10px", padding: "12px" }}>
              <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</div>
              <div style={{ fontSize: "13px", color: "#111827", fontWeight: 600, marginTop: "2px" }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Progress */}
      <div style={{ background: "#fff", borderRadius: "20px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: "20px" }}>
        <h2 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700, color: "#111827" }}>Complaint Progress</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "0", overflow: "auto", paddingBottom: "4px" }}>
          {STATUS_STEPS.map((step, i) => {
            const done = i <= stepIdx;
            const active = i === stepIdx;
            return (
              <div key={step.key} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: "80px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    background: done ? (active ? "#1d4ed8" : "#10b981") : "#e5e7eb",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "14px", fontWeight: 700, color: done ? "#fff" : "#9ca3af",
                    border: active ? "3px solid #bfdbfe" : "none",
                    transition: "all 0.3s"
                  }}>
                    {done && !active ? "✓" : i + 1}
                  </div>
                  <div style={{ fontSize: "10px", textAlign: "center", color: done ? "#111827" : "#9ca3af", fontWeight: done ? 600 : 400, whiteSpace: "nowrap" }}>
                    {step.label}
                  </div>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div style={{ flex: 1, height: "3px", background: i < stepIdx ? "#10b981" : "#e5e7eb", margin: "0 2px", marginBottom: "20px", borderRadius: "2px" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Photos */}
      {(beforePhotos.length > 0 || afterPhotos.length > 0) && (
        <div style={{ background: "#fff", borderRadius: "20px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: "20px" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: "#111827" }}>📷 Photos</h2>
          <div style={{ display: "flex", gap: "16px" }}>
            {beforePhotos.length > 0 && (
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", marginBottom: "8px", textTransform: "uppercase" }}>Before</div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {beforePhotos.map((p, i) => (
                    <img key={i} src={p.url} alt={`before-${i}`} style={{ width: "140px", height: "100px", objectFit: "cover", borderRadius: "10px", border: "2px solid #e5e7eb" }} />
                  ))}
                </div>
              </div>
            )}
            {afterPhotos.length > 0 && (
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#059669", marginBottom: "8px", textTransform: "uppercase" }}>After (Completion Proof)</div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {afterPhotos.map((p, i) => (
                    <img key={i} src={p.url} alt={`after-${i}`} style={{ width: "140px", height: "100px", objectFit: "cover", borderRadius: "10px", border: "2px solid #a7f3d0" }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resolution notes */}
      {complaint.resolutionNotes && (
        <div style={{ background: "#d1fae5", borderRadius: "16px", padding: "20px", marginBottom: "20px", border: "1px solid #a7f3d0" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#065f46", marginBottom: "6px" }}>✅ Resolution Notes</div>
          <p style={{ margin: 0, fontSize: "14px", color: "#374151", lineHeight: "1.6" }}>{complaint.resolutionNotes}</p>
        </div>
      )}

      {/* Rating */}
      {complaint.status === "RESOLVED" && !rated && (
        <div style={{ background: "#fff", borderRadius: "20px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: "20px", border: "2px solid #fbbf24" }}>
          <h2 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 700, color: "#111827" }}>⭐ Rate the Resolution</h2>
          <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#6b7280" }}>How satisfied are you with how your complaint was handled?</p>
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            {[1,2,3,4,5].map(star => (
              <span key={star} onClick={() => setRating(star)} style={{ fontSize: "32px", cursor: "pointer", transition: "transform 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              >
                {star <= rating ? "⭐" : "☆"}
              </span>
            ))}
          </div>
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Optional feedback... (e.g., Fixed in 2 days. Good work!)"
            rows={3}
            style={{ width: "100%", padding: "12px", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", outline: "none", marginBottom: "12px" }}
          />
          <button onClick={handleRate} disabled={rating === 0} style={{
            padding: "12px 28px", background: rating > 0 ? "#1d4ed8" : "#e5e7eb",
            color: rating > 0 ? "#fff" : "#9ca3af", border: "none", borderRadius: "10px",
            cursor: rating > 0 ? "pointer" : "not-allowed", fontWeight: 700, fontFamily: "inherit"
          }}>
            Submit Rating
          </button>
        </div>
      )}

      {rated && (
        <div style={{ background: "#d1fae5", borderRadius: "16px", padding: "20px", marginBottom: "20px", textAlign: "center" }}>
          <div style={{ fontSize: "32px" }}>🎉</div>
          <div style={{ fontWeight: 700, color: "#065f46" }}>Thank you for your feedback!</div>
        </div>
      )}

      {/* Timeline */}
      <div style={{ background: "#fff", borderRadius: "20px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: "20px" }}>
        <h2 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700, color: "#111827" }}>📋 Status Timeline</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {complaint.statusHistory.map((h, i) => {
            const cfg = statusConfig[h.status] || statusConfig.NEW;
            return (
              <div key={i} style={{ display: "flex", gap: "14px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: cfg.bg, border: `2px solid ${cfg.dot}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>
                    {i === complaint.statusHistory.length - 1 ? "●" : "○"}
                  </div>
                  {i < complaint.statusHistory.length - 1 && <div style={{ width: "2px", height: "48px", background: "#e5e7eb" }} />}
                </div>
                <div style={{ paddingBottom: "24px", flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <div>
                      <span style={{ padding: "2px 8px", borderRadius: "10px", background: cfg.bg, color: cfg.color, fontSize: "11px", fontWeight: 700 }}>{cfg.label}</span>
                      <span style={{ marginLeft: "8px", fontSize: "12px", color: "#374151" }}>by <strong>{h.changedByName}</strong> ({h.changedByRole})</span>
                    </div>
                    <span style={{ fontSize: "11px", color: "#9ca3af" }}>{new Date(h.timestamp).toLocaleString("en-IN")}</span>
                  </div>
                  {h.remarks && <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#6b7280" }}>{h.remarks}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comments */}
      <div style={{ background: "#fff", borderRadius: "20px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
        <h2 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: "#111827" }}>💬 Comments</h2>

        {comments.length === 0 && <p style={{ color: "#9ca3af", fontSize: "14px" }}>No comments yet.</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
          {comments.map((c, i) => (
            <div key={i} style={{ background: "#f9fafb", borderRadius: "12px", padding: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg,#1d4ed8,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: 700 }}>
                    {c.authorName[0]}
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{c.authorName}</span>
                  <span style={{ fontSize: "11px", color: "#9ca3af" }}>({c.authorRole})</span>
                </div>
                <span style={{ fontSize: "11px", color: "#9ca3af" }}>{new Date(c.createdAt).toLocaleString("en-IN")}</span>
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#374151" }}>{c.message}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <input
            value={comment}
            onChange={e => setComment(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleComment()}
            placeholder="Add a follow-up comment..."
            style={{ flex: 1, padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none", fontFamily: "inherit" }}
          />
          <button onClick={handleComment} style={{ padding: "10px 20px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>
            Post
          </button>
        </div>
      </div>
    </div>
  );
}