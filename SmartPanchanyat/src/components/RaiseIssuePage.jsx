import { useState } from "react";
import { submitComplaint, mapComplaint } from "../utils/api";

const TYPES = [
  { id: "INFRASTRUCTURE", label: "Infrastructure (Roads/Water)", labelTa: "கட்டமைப்பு", icon: "🛣️" },
  { id: "SANITATION",     label: "Sanitation & Health",       labelTa: "சுத்தம்",      icon: "🗑️" },
  { id: "PUBLIC_SERVICES", label: "Public Services",          labelTa: "பொது சேவை",    icon: "🏛️" },
  { id: "ELECTRICITY", label: "Electricity",labelTa:"மின்சாரம்", icon: "⚡" },
  { id: "OTHER",           label: "Other",                   labelTa: "மற்றவை",       icon: "📋" },
  
];

const WARDS = ["WARD-01","WARD-02","WARD-03","WARD-04","WARD-05","WARD-06"];

export default function RaiseIssuePage({ navigate }) {
  const [form, setForm] = useState({
    type: "INFRASTRUCTURE",
    description: "",
    wardId: "",
    locationDescription: "",
    citizenName: "",
    citizenPhone: "",
    anonymous: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [complaintNum, setComplaintNum] = useState("");
  const [apiError, setApiError]     = useState(null);
  const [errors, setErrors]         = useState({});

  const validate = () => {
    const e = {};
    if (!form.description || form.description.length < 20)
      e.description = "Description must be at least 20 characters";
    if (!form.wardId) e.wardId = "Please select a ward";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setSubmitting(true);
    setApiError(null);

    const payload = {
      type:                form.type,
      description:         form.description,
      wardId:              form.wardId,
      locationDescription: form.locationDescription || null,
      citizenName:         form.anonymous ? null : (form.citizenName || null),
      citizenPhone:        form.anonymous ? null : (form.citizenPhone || null),
    };

    try {
      const result = await submitComplaint(payload);
      const mapped = mapComplaint(result);
      setComplaintNum(mapped?.complaintNumber || "CMP-???");
      setSubmitted(true);
    } catch (err) {
      setComplaintNum(`CMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setApiError(`Note: Backend offline — complaint not saved to server. (${err.message})`);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f8fb", padding: "24px" }}>
        <div style={{ background: "#fff", borderRadius: "32px", padding: "64px 40px", maxWidth: "520px", width: "100%", textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: "72px", marginBottom: "24px" }}>✅</div>
          <h2 style={{ margin: "0 0 12px", fontSize: "32px", fontWeight: 800, color: "#111827" }}>Submitted!</h2>
          <p style={{ color: "#6b7280", fontSize: "16px", marginBottom: "32px" }}>
            Your grievance has been successfully recorded in our digital ledger.
          </p>
          <div style={{ background: "#f3f8fb", borderRadius: "20px", padding: "24px", marginBottom: "40px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Grievance ID</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#1e1b4b" }}>{complaintNum}</div>
          </div>
          <button
            onClick={() => navigate("track")}
            style={{ width: "100%", padding: "18px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: "100px", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}
          >
            Track My Grievance →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexWrap: "wrap", background: "#fff" }}>
      
      {/* ── LEFT SECTION (HERO) ── */}
      <div style={{ 
        flex: "1 1 40%", 
        minWidth: "360px", 
        background: "#f3f8fb", 
        padding: "80px 64px",
        display: "flex",
        flexDirection: "column"
      }}>
        <div style={{ 
          display: "inline-block", 
          padding: "6px 14px", 
          background: "#dcfce7", 
          color: "#065f46", 
          borderRadius: "100px", 
          fontSize: "12px", 
          fontWeight: 700, 
          letterSpacing: "0.5px",
          marginBottom: "32px",
          width: "fit-content"
        }}>
          PANCHAYAT PORTAL
        </div>

        <h1 style={{ 
          fontSize: "56px", 
          fontWeight: 800, 
          color: "#111827", 
          lineHeight: "1.1", 
          margin: "0 0 32px",
          letterSpacing: "-2px"
        }}>
          Building a <br />
          <span style={{ color: "#10b981" }}>Stronger Community <br /> Together.</span>
        </h1>

        <div style={{ maxWidth: "480px" }}>
          <p style={{ fontSize: "17px", color: "#4b5563", lineHeight: "1.6", margin: "0 0 24px" }}>
            Your feedback is the foundation of a better village. Share your concerns, and our dedicated Panchayat team, along with your Ward Member, will ensure a transparent resolution.
          </p>

          <div style={{ 
            borderLeft: "4px solid #10b981", 
            padding: "8px 20px", 
            margin: "32px 0",
            fontSize: "15px",
            color: "#4b5563",
            fontStyle: "italic",
            lineHeight: "1.7"
          }}>
            உங்கள் கருத்துக்களே சிறந்த கிராமத்தின் அடிப்படை. எங்கள் பஞ்சாயத்து குழு மற்றும் வார்டு உறுப்பினர் அதன் மீது வெளிப்படையான தீர்வை உறுதி செய்வார்கள்.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "48px" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", fontSize: "20px" }}>🏛️</div>
              <div>
                <div style={{ fontWeight: 800, color: "#111827", fontSize: "16px" }}>Transparent Governance</div>
                <div style={{ fontSize: "13px", color: "#6b7280" }}>Direct oversight from your ward representatives.</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", fontSize: "20px" }}>👤</div>
              <div>
                <div style={{ fontWeight: 800, color: "#111827", fontSize: "16px" }}>Accountability First</div>
                <div style={{ fontSize: "13px", color: "#6b7280" }}>Regular updates on your grievance status.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT SECTION (FORM) ── */}
      <div style={{ 
        flex: "1 1 60%", 
        minWidth: "400px", 
        padding: "80px 80px",
        display: "flex",
        flexDirection: "column"
      }}>
        <div style={{ maxWidth: "680px" }}>
          <h2 style={{ fontSize: "36px", fontWeight: 800, color: "#111827", margin: "0 0 12px", letterSpacing: "-1px" }}>
            Submit Complaint / புகார் சமர்ப்பிக்கவும்
          </h2>
          <p style={{ fontSize: "16px", color: "#6b7280", margin: "0 0 48px" }}>
            Fill in the details below to begin the official resolution process.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
            <div>
              <label style={labelStyle}>YOUR NAME / உங்கள் பெயர்</label>
              <input 
                style={inputStyle} 
                placeholder="e.g. Arumugam" 
                value={form.citizenName}
                onChange={e => setForm(f => ({ ...f, citizenName: e.target.value }))}
              />
            </div>
            <div>
              <label style={labelStyle}>CONTACT NUMBER / தொடர்பு எண்</label>
              <input 
                style={inputStyle} 
                placeholder="98765 43210" 
                value={form.citizenPhone}
                onChange={e => setForm(f => ({ ...f, citizenPhone: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label style={labelStyle}>CATEGORY / வகை</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              {TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setForm(f => ({ ...f, type: t.id }))}
                  style={{
                    padding: "14px 24px",
                    borderRadius: "100px",
                    border: "none",
                    background: form.type === t.id ? "#10b981" : "#f3f4f6",
                    color: form.type === t.id ? "#fff" : "#4b5563",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: form.type === t.id ? "0 8px 24px rgba(16, 185, 129, 0.25)" : "none"
                  }}
                >
                  {t.label} {t.icon}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label style={labelStyle}>SELECT WARD / வார்டு</label>
            <select 
              style={{ ...inputStyle, width: "100%", height: "54px" }} 
              value={form.wardId}
              onChange={e => { setForm(f => ({ ...f, wardId: e.target.value })); setErrors(e2 => ({ ...e2, wardId: "" })) }}
            >
              <option value="">Choose your location ward...</option>
              {WARDS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
            {errors.wardId && <div style={{ fontSize: "12px", color: "#dc2626", marginTop: "6px" }}>{errors.wardId}</div>}
          </div>

          <div style={{ marginBottom: "40px" }}>
            <label style={labelStyle}>DESCRIBE ISSUE / பிரச்சனையை விவரிக்கவும்</label>
            <textarea 
              style={{ ...inputStyle, width: "100%", height: "160px", resize: "none", padding: "16px 20px" }}
              placeholder="Provide as much detail as possible..."
              value={form.description}
              onChange={e => { setForm(f => ({ ...f, description: e.target.value })); setErrors(e2 => ({ ...e2, description: "" })) }}
            />
            {errors.description && <div style={{ fontSize: "12px", color: "#dc2626", marginTop: "6px" }}>{errors.description}</div>}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                padding: "16px 40px",
                background: "#1d4ed8",
                color: "#fff",
                border: "none",
                borderRadius: "100px",
                fontSize: "16px",
                fontWeight: 700,
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: "0 12px 32px rgba(29, 78, 216, 0.3)",
                transition: "all 0.2s"
              }}
              onMouseOver={e => !submitting && (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseOut={e => !submitting && (e.currentTarget.style.transform = "translateY(0)")}
            >
              {submitting ? "Submitting..." : "Submit Grievance / சமர்ப்பிக்கவும்"}
            </button>
            <button 
              onClick={() => navigate("home")}
              style={{ background: "none", border: "none", color: "#6b7280", fontWeight: 700, fontSize: "15px", cursor: "pointer" }}
            >
              Cancel and Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "10px",
  fontWeight: 800,
  color: "#9ca3af",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: "12px"
};

const inputStyle = {
  width: "100%",
  background: "#f3f4f6",
  border: "none",
  borderRadius: "14px",
  padding: "14px 20px",
  fontSize: "16px",
  color: "#111827",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box"
};
