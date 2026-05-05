import { useState } from "react";
import { DollarSign, UserCircle, Settings } from "lucide-react";
import FundRequestPanel from "./blockchain/FundRequestPanel";

export default function PresidentDashboard({ navigate }) {
  const [activeTab, setActiveTab] = useState("funds");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const tabs = [
    { key: "funds", label: "Fund Requests", icon: <DollarSign size={16} /> },
    { key: "profile", label: "Profile", icon: <UserCircle size={16} /> },
  ];

  return (
    <div style={{ padding: "100px 32px 32px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#000b60", margin: "0 0 8px" }}>
          President Dashboard
        </h1>
        <p style={{ color: "#64748b", margin: 0 }}>
          Welcome back, {currentUser?.fullName || "President"}. Manage fund requests and overview the panchayat.
        </p>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "1px solid #e2e8f0" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "12px 24px",
              background: activeTab === tab.key ? "#fff" : "transparent",
              border: "none",
              borderBottom: activeTab === tab.key ? "2px solid #000b60" : "2px solid transparent",
              color: activeTab === tab.key ? "#000b60" : "#64748b",
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

      <div>
        {activeTab === "funds" && <FundRequestPanel currentUser={currentUser} />}
        {activeTab === "profile" && (
          <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <h3>Profile Settings</h3>
            <p>President profile details will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
