import { useState } from "react";
import { registerUser, getUser, isLoggedIn } from "../utils/api";

export default function RegisterPage({ navigate }) {
  const admin = getUser();
  const isAdmin = isLoggedIn() && admin?.role === "ADMIN";

  const [form, setForm] = useState({
    username: "",
    password: "",
    fullName: "",
    phone: "",
    role: "WARD_MEMBER",
    wardId: "",
    wardName: ""
  });

  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setStatus({ loading: false, error: "Only an Administrator can register new staff. Please log in as Admin first.", success: null });
      return;
    }

    setStatus({ loading: true, error: null, success: null });
    try {
      await registerUser(form);
      setStatus({ loading: false, error: null, success: "Account created successfully!" });
      setForm({ username: "", password: "", fullName: "", phone: "", role: "WARD_MEMBER", wardId: "", wardName: "" });
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: null });
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #0369a1 100%)",
      padding: "24px"
    }}>
      <div style={{
        background: "rgba(255,255,255,0.98)", borderRadius: "24px",
        padding: "40px", width: "100%", maxWidth: "500px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.35)"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "14px",
            background: "linear-gradient(135deg, #1d4ed8, #06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "26px", margin: "0 auto 12px"
          }}>👤</div>
          <h1 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 800, color: "#111827" }}>
            Register Staff
          </h1>
          <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
            Create a new Ward Member or Admin account
          </p>
        </div>

        {/* Security Notice */}
        {!isAdmin && (
          <div style={{
            background: "#fff7ed", border: "1px solid #ffedd5",
            borderRadius: "12px", padding: "14px", marginBottom: "24px",
            color: "#9a3412", fontSize: "13px", textAlign: "center"
          }}>
             🔐 <strong>Access Restricted</strong><br/>
             This page is for Administrators to register staff members. 
             Please <button onClick={() => navigate("login")} style={{ background: "none", border: "none", color: "#1d4ed8", fontWeight: 700, cursor: "pointer", textDecoration: "underline", padding: 0, fontSize: "inherit" }}>log in as Admin</button> to continue.
          </div>
        )}

        {status.error && <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "10px", padding: "10px 14px", marginBottom: "20px", fontSize: "13px", color: "#dc2626" }}>⚠️ {status.error}</div>}
        {status.success && <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: "10px", padding: "10px 14px", marginBottom: "20px", fontSize: "13px", color: "#065f46" }}>✅ {status.success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div style={formGroup}>
              <label style={labelStyle}>Username</label>
              <input required disabled={!isAdmin} value={form.username} onChange={e => setForm({...form, username: e.target.value})} style={inputStyle} placeholder="ward_01" />
            </div>
            <div style={formGroup}>
              <label style={labelStyle}>Password</label>
              <input required disabled={!isAdmin} type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} style={inputStyle} placeholder="••••••••" />
            </div>
          </div>

          <div style={formGroup}>
            <label style={labelStyle}>Full Name</label>
            <input required disabled={!isAdmin} value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} style={inputStyle} placeholder="John Doe" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div style={formGroup}>
              <label style={labelStyle}>Phone Number</label>
              <input required disabled={!isAdmin} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={inputStyle} placeholder="+91..." />
            </div>
            <div style={formGroup}>
              <label style={labelStyle}>Role</label>
              <select disabled={!isAdmin} value={form.role} onChange={e => setForm({...form, role: e.target.value})} style={inputStyle}>
                <option value="WARD_MEMBER">Ward Member</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
          </div>

          {form.role === "WARD_MEMBER" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div style={formGroup}>
                <label style={labelStyle}>Ward ID</label>
                <input required disabled={!isAdmin} value={form.wardId} onChange={e => setForm({...form, wardId: e.target.value})} style={inputStyle} placeholder="WARD-01" />
              </div>
              <div style={formGroup}>
                <label style={labelStyle}>Ward Name</label>
                <input disabled={!isAdmin} value={form.wardName} onChange={e => setForm({...form, wardName: e.target.value})} style={inputStyle} placeholder="North Block" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!isAdmin || status.loading}
            style={{
              width: "100%", padding: "14px",
              background: isAdmin ? "#1d4ed8" : "#94a3b8",
              color: "#fff", border: "none", borderRadius: "12px",
              fontSize: "15px", fontWeight: 700, cursor: isAdmin ? "pointer" : "not-allowed",
              fontFamily: "inherit", marginTop: "12px"
            }}
          >
            {status.loading ? "⏳ Creating Account..." : "Create Account"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <button onClick={() => navigate("login")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#6b7280", fontFamily: "inherit" }}>
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

const formGroup = { marginBottom: "12px" };
const labelStyle = { display: "block", fontSize: "12px", fontWeight: 600, color: "#4b5563", marginBottom: "4px" };
const inputStyle = {
  width: "100%", padding: "10px 12px", border: "1px solid #d1d5db",
  borderRadius: "8px", fontSize: "14px", outline: "none", fontFamily: "inherit",
  color: "#111827", boxSizing: "border-box"
};
