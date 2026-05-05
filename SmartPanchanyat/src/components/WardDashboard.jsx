import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Vote,
  UserCircle,
  ArrowLeft,
  Settings,
} from "lucide-react";
import WardComplaints from "./WardComplaints";
import VotingPanel from "./VotingPanel";
import { getUser } from "../utils/api";

export default function WardDashboard({ navigate }) {
  const [activeTab, setActiveTab] = useState("complaints");
  const currentUser = getUser();

  const tabs = [
    {
      key: "complaints",
      label: "Ward Complaints",
      icon: <FileText size={16} />,
    },
    { key: "voting", label: "Blockchain Voting", icon: <Vote size={16} /> },
    { key: "profile", label: "Profile", icon: <UserCircle size={16} /> },
  ];

  return (
    <div
      style={{
        padding: "100px 32px 32px",
        maxWidth: "1200px",
        margin: "0 auto",
        minHeight: "100vh",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 900,
              color: "#065f46",
              margin: "0 0 8px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            Ward Member Dashboard
          </h1>
          <p style={{ color: "#64748b", margin: 0, fontWeight: 500 }}>
            Welcome back, <strong>{currentUser?.fullName}</strong>. Managing
            Ward:{" "}
            <strong>{currentUser?.wardName || currentUser?.wardId}</strong>
          </p>
        </div>
        <button
          onClick={() => navigate("home")}
          style={{
            padding: "10px 20px",
            background: "#f1f5f9",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#475569",
          }}
        >
          <ArrowLeft size={16} /> Back to Portal
        </button>
      </div>

      {/* Modern Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "12px 24px",
              background: "transparent",
              border: "none",
              borderBottom:
                activeTab === tab.key
                  ? "3px solid #065f46"
                  : "3px solid transparent",
              color: activeTab === tab.key ? "#065f46" : "#64748b",
              fontWeight: activeTab === tab.key ? 800 : 600,
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Rendering */}
      <div style={{ animation: "fadeIn 0.3s ease-in-out" }}>
        {activeTab === "complaints" && <WardComplaints />}

        {activeTab === "voting" && (
          <div style={{ marginTop: "24px" }}>
            <div
              style={{
                background: "#f0fdf4",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid #d1fae5",
                marginBottom: "24px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "#065f46",
                  fontWeight: 600,
                }}
              >
                💡 Review and vote on fund requests initiated by the President.
                Your digital signature is required for blockchain consensus.
              </p>
            </div>
            <VotingPanel currentUser={currentUser} />
          </div>
        )}

        {activeTab === "profile" && (
          <div
            style={{
              background: "#fff",
              padding: "40px",
              borderRadius: "20px",
              border: "1px solid #e2e8f0",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                background: "#f1f5f9",
                borderRadius: "50%",
                margin: "0 auto 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
              }}
            >
              <UserCircle size={48} />
            </div>
            <h3
              style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: 800 }}
            >
              {currentUser?.fullName}
            </h3>
            <p style={{ color: "#64748b", margin: "0 0 24px" }}>
              Ward Member • Ward {currentUser?.wardId}
            </p>

            <div
              style={{
                maxWidth: "400px",
                margin: "0 auto",
                textAlign: "left",
                display: "grid",
                gap: "12px",
              }}
            >
              <div
                style={{
                  padding: "12px",
                  background: "#f8fafc",
                  borderRadius: "10px",
                  fontSize: "14px",
                }}
              >
                <span style={{ fontWeight: 700, color: "#64748b" }}>
                  Wallet Address:
                </span>
                <code style={{ marginLeft: "8px", color: "#0f172a" }}>
                  {currentUser?.walletAddress || "Not Connected"}
                </code>
              </div>
              <div
                style={{
                  padding: "12px",
                  background: "#f8fafc",
                  borderRadius: "10px",
                  fontSize: "14px",
                }}
              >
                <span style={{ fontWeight: 700, color: "#64748b" }}>
                  Status:
                </span>
                <span
                  style={{
                    marginLeft: "8px",
                    color: "#16a34a",
                    fontWeight: 700,
                  }}
                >
                  Active Member
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
