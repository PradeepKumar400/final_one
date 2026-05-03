import { useState } from "react";
import { registerUser } from "../utils/api";
import { UserPlus, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";

const COLORS = {
  primary: "#000b60",
  primaryContainer: "#142283",
  onPrimaryContainer: "#8390f2",
  surface: "#f6fafe",
  surfaceContainerLow: "#f0f4f8",
  onSurface: "#171c1f",
  onSurfaceVariant: "#454652",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
  outline: "#767683",
  secondary: "#515f74",
  tertiaryFixed: "#b1f0ce",
  onTertiaryFixed: "#002114",
  error: "#ba1a1a",
};

export default function RegisterPage({ navigate }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    fullName: "",
    phone: "",
    role: "CITIZEN",
  });

  const [status, setStatus] = useState({
    loading: false,
    error: null,
    success: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: null });
    try {
      await registerUser(form);
      setStatus({
        loading: false,
        error: null,
        success: "Citizen account created successfully! You can now log in.",
      });
      setForm({
        username: "",
        password: "",
        fullName: "",
        phone: "",
        role: "CITIZEN",
      });
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: null });
    }
  };

  const inputStyle = {
    width: "100%",
    backgroundColor: COLORS.surfaceContainerLow,
    border: "none",
    borderRadius: "10px",
    padding: "14px",
    fontSize: "14px",
    color: COLORS.onSurface,
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: "10px",
    fontWeight: 700,
    color: COLORS.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "6px",
    marginLeft: "4px",
  };

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: `linear-gradient(135deg, ${COLORS.surface} 0%, ${COLORS.surfaceContainerLow} 100%)`,
        padding: "70px 24px",
        fontFamily: "'Manrope', sans-serif",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "900px",
          height: "100%",
          maxHeight: "800px",
          display: "flex",
          flexDirection: "row",
          borderRadius: "24px",
          backgroundColor: "#fff",
          boxShadow: "0 20px 50px rgba(0, 11, 96, 0.1)",
          zIndex: 10,
          margin: "auto",
          overflow: "hidden",
        }}
      >
        {/* Left Side: Contextual Info */}
        <div
          className="hidden md:flex"
          style={{
            width: "40%",
            backgroundColor: COLORS.primaryContainer,
            padding: "48px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            color: "#fff",
            position: "relative",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: "100px",
                backgroundColor: "rgba(131, 144, 242, 0.2)",
                color: COLORS.onPrimaryContainer,
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "24px",
              }}
            >
              Citizen Portal
            </div>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: "24px",
              }}
            >
              Join the <br />
              <span style={{ color: COLORS.onPrimaryContainer }}>
                Smart Village
              </span>
            </h1>
            <p
              style={{
                fontSize: "14px",
                opacity: 0.8,
                lineHeight: 1.6,
                marginBottom: "32px",
              }}
            >
              Create your citizen identity to raise complaints, track ward
              progress, and contribute to village development.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "start",
              gap: "16px",
              padding: "20px",
              borderRadius: "16px",
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <ShieldCheck size={28} color={COLORS.onPrimaryContainer} />
            <div>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  marginBottom: "4px",
                }}
              >
                Active Citizenship
              </p>
              <p style={{ fontSize: "11px", opacity: 0.6 }}>
                Your participation helps us build a more transparent and
                efficient Panchayat.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div style={{ flex: 1, padding: "48px", overflowY: "auto" }}>
          <div style={{ maxWidth: "340px", margin: "0 auto" }}>
            <header style={{ marginBottom: "32px" }}>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: COLORS.onSurface,
                  marginBottom: "8px",
                }}
              >
                Citizen Registration
              </h2>
              <p style={{ fontSize: "14px", color: COLORS.onSurfaceVariant }}>
                Set up your secure access to SmartPanchayat services.
              </p>
            </header>

            {status.error && (
              <div
                style={{
                  marginBottom: "24px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  backgroundColor: COLORS.errorContainer,
                  color: COLORS.onErrorContainer,
                  fontSize: "12px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <AlertCircle size={18} />
                {status.error}
              </div>
            )}

            {status.success && (
              <div
                style={{
                  marginBottom: "24px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  backgroundColor: COLORS.tertiaryFixed,
                  color: COLORS.onTertiaryFixed,
                  fontSize: "12px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <CheckCircle2 size={18} />
                {status.success}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  required
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  style={inputStyle}
                  placeholder="Enter Full Name"
                />
              </div>

              <div>
                <label style={labelStyle}>Username / Aadhaar / ID</label>
                <input
                  required
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  style={inputStyle}
                  placeholder="Enter Username"
                />
              </div>

              <div>
                <label style={labelStyle}>Contact Number</label>
                <input
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  style={inputStyle}
                  placeholder="Enter Contact Number"
                />
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  style={inputStyle}
                  placeholder="••••••••"
                />
              </div>

              <div style={{ paddingTop: "12px" }}>
                <button
                  disabled={status.loading}
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "16px",
                    backgroundColor: COLORS.primary,
                    color: "#fff",
                    fontWeight: 700,
                    borderRadius: "10px",
                    border: "none",
                    cursor: status.loading ? "not-allowed" : "pointer",
                    boxShadow: "0 10px 20px rgba(0, 11, 96, 0.2)",
                    opacity: status.loading ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "transform 0.1s",
                  }}
                >
                  <UserPlus size={18} />
                  {status.loading
                    ? "Creating Account..."
                    : "Register as Citizen"}
                </button>
              </div>

              <div style={{ textAlign: "center", paddingTop: "16px" }}>
                <p style={{ fontSize: "12px", color: COLORS.secondary }}>
                  Already have an account?
                </p>
                <button
                  type="button"
                  onClick={() => navigate("login")}
                  style={{
                    background: "none",
                    border: "none",
                    color: COLORS.primary,
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    marginTop: "4px",
                    textDecoration: "underline",
                  }}
                >
                  Log in here
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
