import { useState } from "react";
import { login, getUser } from "../utils/api";

export default function LoginPage({ navigate, onLogin }) {
  const [form, setForm]       = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handleLogin = async () => {
    if (!form.username.trim() || !form.password.trim()) {
      setError("Please enter username and password");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await login(form.username.trim(), form.password.trim());
      onLogin(data);
      // Redirect based on role
      if (data.role === "ADMIN") navigate("admin");
      else if (data.role === "WARD_MEMBER") navigate("ward");
      else navigate("home");
    } catch (err) {
      setError(err.message || "Invalid username or password");
    } finally {
      setLoading(false);
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
        background: "rgba(255,255,255,0.97)", borderRadius: "24px",
        padding: "48px 40px", width: "100%", maxWidth: "420px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.35)"
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "16px",
            background: "linear-gradient(135deg, #1d4ed8, #06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "30px", margin: "0 auto 16px"
          }}>🏛️</div>
          <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 800, color: "#111827" }}>
            SmartPanchayat
          </h1>
          <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
            Staff Portal — Admin &amp; Ward Members
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#fee2e2", border: "1px solid #fca5a5",
            borderRadius: "10px", padding: "10px 14px",
            marginBottom: "20px", fontSize: "13px", color: "#dc2626"
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Username */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
            Username
          </label>
          <input
            type="text"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="e.g. admin@panchayat"
            autoComplete="username"
            style={{
              width: "100%", padding: "11px 14px",
              border: "1px solid #d1d5db", borderRadius: "10px",
              fontSize: "14px", outline: "none", fontFamily: "inherit",
              color: "#111827", boxSizing: "border-box",
              transition: "border 0.2s"
            }}
            onFocus={e => e.target.style.borderColor = "#1d4ed8"}
            onBlur={e => e.target.style.borderColor = "#d1d5db"}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
            Password
          </label>
          <input
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="••••••••"
            autoComplete="current-password"
            style={{
              width: "100%", padding: "11px 14px",
              border: "1px solid #d1d5db", borderRadius: "10px",
              fontSize: "14px", outline: "none", fontFamily: "inherit",
              color: "#111827", boxSizing: "border-box",
              transition: "border 0.2s"
            }}
            onFocus={e => e.target.style.borderColor = "#1d4ed8"}
            onBlur={e => e.target.style.borderColor = "#d1d5db"}
          />
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "14px",
            background: loading
              ? "#93c5fd"
              : "linear-gradient(135deg, #1d4ed8, #1e40af)",
            color: "#fff", border: "none", borderRadius: "12px",
            fontSize: "15px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit", transition: "opacity 0.2s"
          }}
        >
          {loading ? "⏳ Signing in..." : "🔐 Sign In"}
        </button>

        {/* Link to Register */}
        <div style={{ marginTop: "16px", textAlign: "center", fontSize: "13px", color: "#6b7280" }}>
          Don't have an account?{" "}
          <button
            onClick={() => navigate("register")}
            style={{
              background: "none", border: "none", color: "#1d4ed8",
              fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              padding: 0, fontSize: "inherit"
            }}
          >
            Register Staff
          </button>
        </div>

        {/* Back to citizen view */}
        <div style={{ marginTop: "12px", textAlign: "center" }}>
          <button
            onClick={() => navigate("home")}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: "13px", color: "#6b7280", fontFamily: "inherit"
            }}
          >
            ← Back to Citizen Portal
          </button>
        </div>

        {/* Role hint */}
        <div style={{
          marginTop: "24px", padding: "14px",
          background: "#f0f9ff", borderRadius: "10px",
          border: "1px solid #bae6fd"
        }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#0369a1", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Role Access
          </div>
          <div style={{ fontSize: "12px", color: "#0c4a6e", lineHeight: "1.6" }}>
            🔴 <strong>Admin</strong> — All complaints, verify, assign, analytics<br />
            🟢 <strong>Ward Member</strong> — Own ward only, acknowledge, update progress
          </div>
        </div>
      </div>
    </div>
  );
}
