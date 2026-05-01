import { useState, useRef, useEffect } from "react";
import {
  submitComplaint,
  mapComplaint,
  uploadComplaintPhotos,
} from "../utils/api";
import {
  Construction,
  Trash2,
  Building2,
  Zap,
  FileText,
  CheckCircle,
  ArrowRight,
  Landmark,
  ShieldCheck,
  Camera,
  X,
} from "lucide-react";

const TYPES = [
  {
    id: "INFRASTRUCTURE",
    label: "Infrastructure (Roads/Water)",
    labelTa: "கட்டமைப்பு",
    icon: <Construction size={18} />,
  },
  {
    id: "SANITATION",
    label: "Sanitation & Health",
    labelTa: "சுத்தம்",
    icon: <Trash2 size={18} />,
  },
  {
    id: "PUBLIC_SERVICES",
    label: "Public Services",
    labelTa: "பொது சேவை",
    icon: <Building2 size={18} />,
  },
  {
    id: "ELECTRICITY",
    label: "Electricity",
    labelTa: "மின்சாரம்",
    icon: <Zap size={18} />,
  },
  {
    id: "OTHER",
    label: "Other",
    labelTa: "மற்றவை",
    icon: <FileText size={18} />,
  },
];

const WARDS = [
  "WARD-01",
  "WARD-02",
  "WARD-03",
  "WARD-04",
  "WARD-05",
  "WARD-06",
];

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
  const [submitted, setSubmitted] = useState(false);
  const [complaintNum, setComplaintNum] = useState("");
  const [apiError, setApiError] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const validate = () => {
    const e = {};
    if (!form.description || form.description.length < 20)
      e.description = "Description must be at least 20 characters";
    if (!form.wardId) e.wardId = "Please select a ward";
    return e;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setSubmitting(true);
    setApiError(null);

    const payload = {
      type: form.type,
      description: form.description,
      wardId: form.wardId,
      locationDescription: form.locationDescription || null,
      citizenName: form.anonymous ? null : form.citizenName || null,
      citizenPhone: form.anonymous ? null : form.citizenPhone || null,
    };

    try {
      const result = await submitComplaint(payload);
      const mapped = mapComplaint(result);

      if (selectedFile && mapped?.id) {
        try {
          await uploadComplaintPhotos(mapped.id, [selectedFile]);
        } catch (photoErr) {
          console.error("Photo upload failed:", photoErr);
          setApiError("Complaint saved, but photo upload failed.");
        }
      }

      setComplaintNum(mapped?.complaintNumber || "CMP-???");
      setSubmitted(true);
    } catch (err) {
      console.error("Submission failed:", err);
      setApiError(`Failed to save complaint on server: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f3f8fb",
          padding: "24px",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "32px",
            padding: "64px 40px",
            maxWidth: "520px",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 24px 64px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "24px",
            }}
          >
            <CheckCircle size={72} color="#10b981" />
          </div>
          <h2
            style={{
              margin: "0 0 12px",
              fontSize: "32px",
              fontWeight: 800,
              color: "#111827",
            }}
          >
            Submitted!
          </h2>
          <p
            style={{ color: "#6b7280", fontSize: "16px", marginBottom: "32px" }}
          >
            Your grievance has been successfully recorded in our digital ledger.
          </p>
          <div
            style={{
              background: "#f3f8fb",
              borderRadius: "20px",
              padding: "24px",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#1d4ed8",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "8px",
              }}
            >
              Grievance ID
            </div>
            <div
              style={{ fontSize: "28px", fontWeight: 800, color: "#1e1b4b" }}
            >
              {complaintNum}
            </div>
          </div>
          <button
            onClick={() => navigate("track")}
            style={{
              width: "100%",
              padding: "18px",
              background: "#1d4ed8",
              color: "#fff",
              border: "none",
              borderRadius: "100px",
              fontSize: "16px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            Track My Grievance <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        background: "#fff",
        overflow: "hidden",
      }}
    >
      {/* ── LEFT SECTION (HERO/INFO) ── */}
      <div
        style={{
          flex: "0 0 420px",
          background: "#f3f8fb",
          padding: "64px 48px",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #e2e8f0",
          position: "sticky",
          top: 0,
          height: "100vh",
          boxSizing: "border-box",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "6px 14px",
            background: "#dcfce7",
            color: "#065f46",
            borderRadius: "100px",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "1px",
            marginBottom: "32px",
            width: "fit-content",
          }}
        >
          PANCHAYAT PORTAL
        </div>

        <h1
          style={{
            fontSize: "42px",
            fontWeight: 800,
            color: "#111827",
            lineHeight: "1.1",
            margin: "0 0 24px",
            letterSpacing: "-1.5px",
          }}
        >
          Building a <br />
          <span style={{ color: "#10b981" }}>
            Stronger Community <br /> Together.
          </span>
        </h1>

        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: "16px",
              color: "#4b5563",
              lineHeight: "1.6",
              margin: "0 0 24px",
            }}
          >
            Your feedback is the foundation of a better village. Share your
            concerns, and our dedicated Panchayat team will ensure a transparent
            resolution.
          </p>

          <div
            style={{
              borderLeft: "4px solid #10b981",
              padding: "4px 20px",
              margin: "32px 0",
              fontSize: "14px",
              color: "#4b5563",
              fontStyle: "italic",
              lineHeight: "1.7",
              background: "rgba(16, 185, 129, 0.05)",
              borderRadius: "0 12px 12px 0",
            }}
          >
            உங்கள் கருத்துக்களே சிறந்த கிராமத்தின் அடிப்படை. வார்டு உறுப்பினர்
            அதன் மீது வெளிப்படையான தீர்வை உறுதி செய்வார்கள்.
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              marginTop: "40px",
            }}
          >
            <div
              style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <Landmark size={20} color="#10b981" />
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    color: "#111827",
                    fontSize: "15px",
                  }}
                >
                  Transparent Governance
                </div>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                  Direct oversight from reps.
                </div>
              </div>
            </div>
            <div
              style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <ShieldCheck size={20} color="#10b981" />
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    color: "#111827",
                    fontSize: "15px",
                  }}
                >
                  Accountability First
                </div>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                  Regular status updates.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "auto" }}>
          © 2024 Digital Panchayat Initiative
        </div>
      </div>

      {/* ── RIGHT SECTION (FORM) ── */}
      <div
        style={{
          flex: 1,
          padding: "64px 80px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflowY: "auto",
          background: "#fff",
        }}
      >
        <div style={{ width: "100%", maxWidth: "1100px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "40px",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "32px",
                  fontWeight: 800,
                  color: "#111827",
                  margin: "0 0 8px",
                  letterSpacing: "-0.5px",
                }}
              >
                Submit Complaint / புகார்
              </h2>
              <p style={{ fontSize: "15px", color: "#6b7280", margin: 0 }}>
                Fill in the details below to begin the official resolution
                process.
              </p>
            </div>
            <button
              onClick={() => navigate("home")}
              style={{
                background: "#f3f4f6",
                border: "none",
                color: "#4b5563",
                fontWeight: 700,
                fontSize: "13px",
                padding: "10px 16px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              marginBottom: "32px",
            }}
          >
            <div>
              <label style={labelStyle}>YOUR NAME / பெயர்</label>
              <input
                style={inputStyle}
                placeholder="e.g. Arumugam"
                value={form.citizenName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, citizenName: e.target.value }))
                }
              />
            </div>
            <div>
              <label style={labelStyle}>CONTACT / தொடர்பு எண்</label>
              <input
                style={inputStyle}
                placeholder="98765 43210"
                value={form.citizenPhone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, citizenPhone: e.target.value }))
                }
              />
            </div>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label style={labelStyle}>CATEGORY / வகை</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setForm((f) => ({ ...f, type: t.id }))}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "12px",
                    border: "none",
                    background: form.type === t.id ? "#10b981" : "#f3f4f6",
                    color: form.type === t.id ? "#fff" : "#4b5563",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow:
                      form.type === t.id
                        ? "0 4px 12px rgba(16, 185, 129, 0.2)"
                        : "none",
                  }}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              marginBottom: "32px",
            }}
          >
            <div>
              <label style={labelStyle}>SELECT WARD / வார்டு</label>
              <select
                style={{ ...inputStyle, width: "100%", height: "50px" }}
                value={form.wardId}
                onChange={(e) => {
                  setForm((f) => ({ ...f, wardId: e.target.value }));
                  setErrors((e2) => ({ ...e2, wardId: "" }));
                }}
              >
                <option value="">Select Ward...</option>
                {WARDS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
              {errors.wardId && (
                <div
                  style={{
                    fontSize: "11px",
                    color: "#dc2626",
                    marginTop: "4px",
                  }}
                >
                  {errors.wardId}
                </div>
              )}
            </div>
            <div>
              <label style={labelStyle}>ANONYMOUS / அநாமதேய</label>
              <div
                onClick={() =>
                  setForm((f) => ({ ...f, anonymous: !f.anonymous }))
                }
                style={{
                  height: "50px",
                  background: "#f3f4f6",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 16px",
                  cursor: "pointer",
                  color: form.anonymous ? "#10b981" : "#6b7280",
                  fontWeight: 700,
                  fontSize: "14px",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "4px",
                    border: "2px solid",
                    borderColor: form.anonymous ? "#10b981" : "#d1d5db",
                    background: form.anonymous ? "#10b981" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                >
                  {form.anonymous && <CheckCircle size={14} />}
                </div>
                {form.anonymous ? "Identity Hidden" : "Hide My Identity"}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "40px" }}>
            <label style={labelStyle}>DESCRIBE ISSUE / விவரம்</label>
            <textarea
              style={{
                ...inputStyle,
                width: "100%",
                height: "140px",
                resize: "none",
              }}
              placeholder="Provide as much detail as possible..."
              value={form.description}
              onChange={(e) => {
                setForm((f) => ({ ...f, description: e.target.value }));
                setErrors((e2) => ({ ...e2, description: "" }));
              }}
            />
            {errors.description && (
              <div
                style={{ fontSize: "11px", color: "#dc2626", marginTop: "4px" }}
              >
                {errors.description}
              </div>
            )}
          </div>

          <div style={{ marginBottom: "40px" }}>
            <label style={labelStyle}>
              ATTACH PHOTO / புகைப்படம் (Optional)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "100%",
                height: "160px",
                border: "2px dashed #e2e8f0",
                borderRadius: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
                background: previewUrl ? `url(${previewUrl})` : "#f9fafb",
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.borderColor = "#10b981")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.borderColor = "#e2e8f0")
              }
            >
              {previewUrl && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: "14px",
                      textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                    }}
                  >
                    Click to Change
                  </div>
                </div>
              )}
              {!previewUrl && (
                <>
                  <Camera
                    size={32}
                    color="#9ca3af"
                    style={{ marginBottom: "12px" }}
                  />
                  <div
                    style={{
                      fontWeight: 700,
                      color: "#4b5563",
                      fontSize: "14px",
                    }}
                  >
                    Click to capture or upload photo
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#9ca3af",
                      marginTop: "4px",
                    }}
                  >
                    PNG, JPG up to 10MB
                  </div>
                </>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: "none" }}
              />
            </div>
            {selectedFile && (
              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    color: "#10b981",
                    fontWeight: 700,
                  }}
                >
                  ✓ {selectedFile.name}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <X size={14} /> Remove
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: "100%",
              padding: "18px",
              background: "#1d4ed8",
              color: "#fff",
              border: "none",
              borderRadius: "14px",
              fontSize: "16px",
              fontWeight: 800,
              cursor: submitting ? "not-allowed" : "pointer",
              boxShadow: "0 12px 24px rgba(29, 78, 216, 0.25)",
              transition: "all 0.2s",
            }}
          >
            {submitting
              ? "Processing..."
              : "Submit My Grievance / சமர்ப்பிக்கவும்"}
          </button>
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
  marginBottom: "12px",
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
  boxSizing: "border-box",
};
