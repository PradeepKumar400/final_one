import { useState } from "react";
import { login } from "../utils/api";
import { ShieldAlert, User, Lock, LogIn, ArrowLeft } from "lucide-react";

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
  secondary: "#515f74"
};

export default function LoginPage({ navigate, onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    <main style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: `linear-gradient(135deg, ${COLORS.surface} 0%, ${COLORS.surfaceContainerLow} 100%)`,
      padding: "24px",
      fontFamily: "'Manrope', sans-serif",
      boxSizing: "border-box"
    }}>
      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: "900px",
        display: "flex",
        flexDirection: "row",
        borderRadius: "24px",
        backgroundColor: "#fff",
        boxShadow: "0 20px 50px rgba(0, 11, 96, 0.15)",
        zIndex: 10,
        margin: "auto"
      }}>
        
        {/* Left Side: Contextual Info */}
        <div className="hidden md:flex" style={{
          width: "40%",
          backgroundColor: COLORS.primaryContainer,
          padding: "48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          color: "#fff",
          position: "relative"
        }}>
          <h1 style={{ fontSize: "36px", fontWeight: 800, lineHeight: 1.1, marginBottom: "16px" }}>
            Login <br/><span style={{ color: COLORS.onPrimaryContainer }}>Gateway</span>
          </h1>
          <p style={{ fontSize: "14px", opacity: 0.8, lineHeight: 1.6, marginBottom: "32px" }}>
            Login to access the administrative dashboard, manage complaints, and coordinate ward activities.
          </p>
          <div style={{
            padding: "16px",
            borderRadius: "12px",
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)"
          }}>
              <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.6, marginBottom: "8px" }}>Security Protocol</p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Lock size={16} color={COLORS.onPrimaryContainer} />
                  <p style={{ fontSize: "12px", fontWeight: 500 }}>Session-based encryption active.</p>
              </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div style={{ flex: 1, padding: "48px" }}>
          <div style={{ maxWidth: "320px", margin: "0 auto" }}>
            <header style={{ marginBottom: "32px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 700, color: COLORS.onSurface, marginBottom: "8px" }}>Login</h2>
              <p style={{ fontSize: "14px", color: COLORS.onSurfaceVariant }}>Welcome back. Enter your secure credentials.</p>
            </header>

            {error && (
              <div style={{
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
                border: "1px solid rgba(147, 0, 10, 0.1)"
              }}>
                <ShieldAlert size={18} />
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: COLORS.onSurfaceVariant, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px", marginLeft: "4px" }}>Username</label>
                <div style={{ position: "relative" }}>
                   <input 
                    required 
                    value={form.username}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    style={{
                      width: "100%",
                      backgroundColor: COLORS.surfaceContainerLow,
                      border: "none",
                      borderRadius: "10px",
                      padding: "14px 14px 14px 44px",
                      fontSize: "14px",
                      color: COLORS.onSurface,
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                    placeholder="Enter Username" 
                  />
                  <User size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: COLORS.outline }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: COLORS.onSurfaceVariant, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px", marginLeft: "4px" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input 
                    required 
                    type="password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    style={{
                      width: "100%",
                      backgroundColor: COLORS.surfaceContainerLow,
                      border: "none",
                      borderRadius: "10px",
                      padding: "14px 14px 14px 44px",
                      fontSize: "14px",
                      color: COLORS.onSurface,
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                    placeholder="••••••••" 
                  />
                  <Lock size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: COLORS.outline }} />
                </div>
              </div>

              <div style={{ paddingTop: "8px" }}>
                <button 
                  onClick={handleLogin}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "16px",
                    backgroundColor: COLORS.primary,
                    color: "#fff",
                    fontWeight: 700,
                    borderRadius: "10px",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 10px 20px rgba(0, 11, 96, 0.2)",
                    opacity: loading ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "transform 0.1s"
                  }}
                >
                  {loading ? "Verifying..." : (<><LogIn size={18} /> Secure Entry</>)}
                </button>
              </div>

              <div style={{ textAlign: "center", paddingTop: "16px" }}>
                  <p style={{ fontSize: "12px", color: COLORS.secondary, fontMedium: 500 }}>Not a staff member?</p>
                  <button 
                    onClick={() => navigate("register")} 
                    style={{
                      background: "none",
                      border: "none",
                      color: COLORS.primary,
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      marginTop: "4px",
                      textDecoration: "underline"
                    }}
                  >
                    Citizen Registration
                  </button>
              </div>

              <div style={{ textAlign: "center" }}>
                  <button 
                    onClick={() => navigate("home")} 
                    style={{
                      background: "none",
                      border: "none",
                      color: COLORS.secondary,
                      fontSize: "10px",
                      cursor: "pointer",
                      marginTop: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      margin: "0 auto"
                    }}
                  >
                    <ArrowLeft size={14} />
                    Return to Citizen Portal
                  </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
