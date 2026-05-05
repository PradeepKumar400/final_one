import { useState, useEffect } from "react";
import {
  adminListComplaints,
  adminAssign,
  adminEscalate,
  adminComment,
  adminAnalytics,
  registerUser,
  mapComplaint,
  getUser,
  getStaffList,
} from "../utils/api";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/web3Config";
import {
  LayoutDashboard,
  PieChart,
  UserPlus,
  RefreshCw,
  AlertCircle,
  Phone,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Wrench,
  MessageSquare,
  Plus,
  LayoutList,
  Clock,
  Activity,
  TrendingUp,
  BarChart3,
  Search,
  ChevronRight,
  ShieldCheck,
  Database,
  FileText,
  FileDigit,
} from "lucide-react";
import GenesisLedger from "./blockchain/GenesisLedger";

const STATUS_COLOR = {
  NEW: {
    bg: "#dbeafe",
    color: "#1e40af",
    label: "New",
    icon: <Clock size={14} />,
  },
  PENDING_REVIEW: {
    bg: "#fef3c7",
    color: "#92400e",
    label: "Pending",
    icon: <Clock size={14} />,
  },
  VERIFIED: {
    bg: "#d1fae5",
    color: "#065f46",
    label: "Verified",
    icon: <CheckCircle size={14} />,
  },
  REJECTED: {
    bg: "#fee2e2",
    color: "#991b1b",
    label: "Rejected",
    icon: <XCircle size={14} />,
  },
  ASSIGNED: {
    bg: "#ede9fe",
    color: "#5b21b6",
    label: "Assigned",
    icon: <UserPlus size={14} />,
  },
  IN_PROGRESS: {
    bg: "#ffedd5",
    color: "#92400e",
    label: "In Progress",
    icon: <Activity size={14} />,
  },
  RESOLVED: {
    bg: "#d1fae5",
    color: "#065f46",
    label: "Resolved",
    icon: <CheckCircle size={14} />,
  },
  CLOSED: {
    bg: "#f3f4f6",
    color: "#374151",
    label: "Closed",
    icon: <CheckCircle size={14} />,
  },
  ESCALATED: {
    bg: "#fee2e2",
    color: "#7f1d1d",
    label: "Escalated",
    icon: <AlertCircle size={14} />,
  },
};

const PRIORITY_COLOR = {
  URGENT: { bg: "#fee2e2", color: "#dc2626" },
  NORMAL: { bg: "#dbeafe", color: "#1d4ed8" },
  LOW: { bg: "#f3f4f6", color: "#6b7280" },
};

export default function AdminDashboard({ navigate }) {
  const user = getUser();
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("complaints");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  // ── Action modal state ───────────────────────────────────────────────────
  const [assignModal, setAssignModal] = useState(null);
  const [progressModal, setProgressModal] = useState(null);
  const [commentModal, setCommentModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // ── Registration State ───────────────────────────────────────────────────
  const [regForm, setRegForm] = useState({
    username: "",
    password: "",
    fullName: "",
    phone: "",
    role: "WARD_MEMBER",
    wardId: "",
    wardName: "",
  });
  const [regStatus, setRegStatus] = useState({
    loading: false,
    error: null,
    success: null,
    walletInfo: null,
  });

  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [blockchainRegLoading, setBlockchainRegLoading] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      params.size = 50;
      const data = await adminListComplaints(params);
      const items = Array.isArray(data) ? data : (data?.content ?? []);

      // EXCLUDE 'NEW' and 'PENDING_REVIEW' from Admin view — these are for Ward Members only now
      const filteredItems = items.filter(
        (c) => c.status !== "NEW" && c.status !== "PENDING_REVIEW",
      );

      setComplaints(filteredItems.map(mapComplaint));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await adminAnalytics();
      setAnalytics(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, [filterStatus, filterPriority]);
  useEffect(() => {
    if (activeTab === "analytics") loadAnalytics();
    if (activeTab === "register") loadStaff();
  }, [activeTab]);

  const loadStaff = async () => {
    setStaffLoading(true);
    try {
      const data = await getStaffList();
      setStaffList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setStaffLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegStatus({
      loading: true,
      error: null,
      success: null,
      walletInfo: null,
    });
    try {
      const data = await registerUser(regForm);

      setRegStatus({
        loading: false,
        error: null,
        success:
          "Staff created! Copy the setup link below to send to the user.",
        walletInfo: {
          setupToken: data.walletSetupToken,
        },
      });
      setRegForm({
        username: "",
        password: "",
        fullName: "",
        phone: "",
        role: "WARD_MEMBER",
        wardId: "",
        wardName: "",
      });
      loadStaff();
    } catch (err) {
      setRegStatus({
        loading: false,
        error: err.message,
        success: null,
        walletInfo: null,
      });
    }
  };

  const registerOnChain = async (staff) => {
    if (!staff.walletAddress) {
      alert("Staff hasn't set up their wallet yet.");
      return;
    }
    setBlockchainRegLoading(staff.userId);
    try {
      if (!window.ethereum) throw new Error("MetaMask not found");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer,
      );

      let tx;
      if (staff.role === "PRESIDENT") {
        tx = await contract.registerPresident(staff.walletAddress);
      } else {
        tx = await contract.registerWardMember(staff.walletAddress);
      }

      await tx.wait();
      alert(`Success! ${staff.fullName} is now registered on blockchain.`);
      loadStaff();
    } catch (err) {
      console.error(err);
      alert("Blockchain Registration Failed: " + (err.reason || err.message));
    } finally {
      setBlockchainRegLoading(null);
    }
  };

  const doAssign = async (id, technicianName) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await adminAssign(id, {
        technicianId: "00000000-0000-0000-0000-000000000001",
        technicianName,
      });
      setAssignModal(null);
      load();
    } catch (e) {
      setActionError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const doProgress = async (id, status, notes, remarks) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const { wardUpdateProgress } = await import("../utils/api");
      await wardUpdateProgress(id, status, notes, remarks);
      setProgressModal(null);
      load();
    } catch (e) {
      setActionError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const doEscalate = async (id, reason) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await adminEscalate(id, reason);
      load();
    } catch (e) {
      setActionError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const doComment = async (id, message, isPublic) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await adminComment(id, message, isPublic);
      setCommentModal(null);
      load();
    } catch (e) {
      setActionError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const cardStyle = {
    background: "#fff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
    marginBottom: "12px",
    cursor: "pointer",
    border: "1px solid #f3f4f6",
    transition: "all 0.2s",
  };

  return (
    <div
      style={{
        width: "100%",
        padding: "100px 48px 40px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "28px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1
            style={{
              margin: "0 0 4px",
              fontSize: "26px",
              fontWeight: 800,
              color: "#111827",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <LayoutDashboard size={24} color="#ef4444" /> Admin Dashboard
          </h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
            Welcome, <strong>{user?.fullName || user?.username}</strong>
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate("home")}
            style={{
              padding: "8px 16px",
              background: "#f3f4f6",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 700,
            }}
          >
            <ArrowLeft size={14} /> Citizen View
          </button>
          <button
            onClick={() => navigate("fund-management")}
            style={{
              padding: "8px 16px",
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 700,
            }}
          >
            <Database size={14} /> Fund Management
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "24px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        {[
          {
            key: "complaints",
            label: "Complaints",
            icon: <LayoutList size={16} />,
          },
          {
            key: "analytics",
            label: "Analytics",
            icon: <BarChart3 size={16} />,
          },
          {
            key: "register",
            label: "Manage Staff",
            icon: <UserPlus size={16} />,
          },
          {
            key: "blockchain",
            label: "Blockchain",
            icon: <ShieldCheck size={16} />,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "12px 20px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: activeTab === tab.key ? 700 : 500,
              color: activeTab === tab.key ? "#1d4ed8" : "#6b7280",
              borderBottom:
                activeTab === tab.key
                  ? "2px solid #1d4ed8"
                  : "2px solid transparent",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* COMPLAINTS TAB */}
      {activeTab === "complaints" && (
        <>
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div style={{ position: "relative" }}>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: "10px 16px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  background: "#fff",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="">All Statuses</option>
                {Object.entries(STATUS_COLOR)
                  .filter(([v, c]) => v !== "NEW" && v !== "PENDING_REVIEW")
                  .map(([v, c]) => (
                    <option key={v} value={v}>
                      {c.label}
                    </option>
                  ))}
              </select>
            </div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              style={{
                padding: "10px 16px",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                fontSize: "13px",
                fontFamily: "inherit",
                background: "#fff",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="">All Priorities</option>
              <option value="URGENT">🔴 Urgent</option>
              <option value="NORMAL">🔵 Normal</option>
              <option value="LOW">⚪ Low</option>
            </select>
            <button
              onClick={load}
              style={{
                padding: "10px 16px",
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "13px",
                fontFamily: "inherit",
                color: "#1d4ed8",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <span
              style={{
                marginLeft: "auto",
                fontSize: "13px",
                color: "#6b7280",
                alignSelf: "center",
                fontWeight: 600,
              }}
            >
              {complaints.length} Records Found
            </span>
          </div>

          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "100px 0",
                color: "#9ca3af",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <RefreshCw
                  size={48}
                  className="spin"
                  style={{ animation: "spin 2s linear infinite" }}
                />
              </div>
              <p style={{ fontWeight: 600 }}>Syncing Ledger...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "100px 0",
                color: "#9ca3af",
                background: "#fff",
                borderRadius: "20px",
                border: "1px dashed #e5e7eb",
              }}
            >
              <FileText size={64} style={{ marginBottom: "20px" }} />
              <h3 style={{ fontSize: "18px", color: "#374151" }}>
                No complaints found
              </h3>
              <p>Try adjusting your search criteria</p>
            </div>
          ) : (
            complaints.map((c) => {
              const st = STATUS_COLOR[c.status] || STATUS_COLOR.NEW;
              const pri = PRIORITY_COLOR[c.priority] || PRIORITY_COLOR.NORMAL;
              return (
                <div
                  key={c.id}
                  style={cardStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 8px 24px rgba(0,0,0,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 1px 4px rgba(0,0,0,0.07)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginBottom: "12px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          flexWrap: "wrap",
                          marginBottom: "6px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: 800,
                            color: "#1d4ed8",
                          }}
                        >
                          #{c.complaintNumber}
                        </span>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 700,
                            ...st,
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          {st.icon} {st.label}
                        </span>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 700,
                            ...pri,
                          }}
                        >
                          {c.priority}
                        </span>
                        {c.isSlaBreached && (
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "11px",
                              fontWeight: 800,
                              background: "#fee2e2",
                              color: "#dc2626",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <AlertCircle size={12} /> SLA
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          display: "flex",
                          gap: "12px",
                          alignItems: "center",
                        }}
                      >
                        <span>{c.type}</span>
                        <span
                          style={{
                            width: 3,
                            height: 3,
                            background: "#d1d5db",
                            borderRadius: "50%",
                          }}
                        />
                        <span>{c.wardName}</span>
                        <span
                          style={{
                            width: 3,
                            height: 3,
                            background: "#d1d5db",
                            borderRadius: "50%",
                          }}
                        />
                        <span>{c.citizenName}</span>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#9ca3af",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Clock size={12} />{" "}
                      {new Date(c.createdAt).toLocaleString("en-IN")}
                    </div>
                  </div>

                  <p
                    style={{
                      margin: "0 0 16px",
                      fontSize: "14px",
                      color: "#374151",
                      lineHeight: "1.5",
                    }}
                  >
                    {c.description.slice(0, 150)}
                    {c.description.length > 150 ? "..." : ""}
                  </p>

                  {c.rejectionReason && (
                    <div
                      style={{
                        background: "#fee2e2",
                        borderRadius: "10px",
                        padding: "10px 14px",
                        marginBottom: "16px",
                        fontSize: "13px",
                        color: "#991b1b",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <XCircle size={16} /> <strong>Rejected:</strong>{" "}
                      {c.rejectionReason}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                      borderTop: "1px solid #f3f4f6",
                      paddingTop: "16px",
                    }}
                  >
                    {(c.status === "NEW" || c.status === "PENDING_REVIEW") && (
                      <ActionBtn
                        color="#1d4ed8"
                        bg="#eff6ff"
                        onClick={() => setVerifyModal(c)}
                      >
                        <CheckCircle size={14} /> Verify / Reject
                      </ActionBtn>
                    )}
                    {c.status === "VERIFIED" && (
                      <ActionBtn
                        color="#7c3aed"
                        bg="#f5f3ff"
                        onClick={() => setAssignModal(c)}
                      >
                        <Wrench size={14} /> Assign Technician
                      </ActionBtn>
                    )}
                    {["ASSIGNED", "IN_PROGRESS"].includes(c.status) && (
                      <ActionBtn
                        color="#c2410c"
                        bg="#fff7ed"
                        onClick={() => setProgressModal(c)}
                      >
                        <RefreshCw size={14} /> Update Progress
                      </ActionBtn>
                    )}
                    {!["REJECTED", "CLOSED", "ESCALATED"].includes(
                      c.status,
                    ) && (
                      <ActionBtn
                        color="#dc2626"
                        bg="#fef2f2"
                        onClick={() => {
                          const r = prompt("Escalation reason?");
                          if (r) doEscalate(c.id, r);
                        }}
                      >
                        <AlertCircle size={14} /> Escalate
                      </ActionBtn>
                    )}
                    <ActionBtn
                      color="#4b5563"
                      bg="#f3f4f6"
                      onClick={() => setCommentModal(c)}
                    >
                      <MessageSquare size={14} /> Comment
                    </ActionBtn>
                  </div>
                </div>
              );
            })
          )}
        </>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === "analytics" && analytics && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "20px",
          }}
        >
          {[
            {
              label: "Total Complaints",
              value: analytics.totalComplaints,
              color: "#1d4ed8",
              icon: <LayoutList size={20} />,
            },
            {
              label: "Open Issues",
              value: analytics.openComplaints,
              color: "#d97706",
              icon: <Activity size={20} />,
            },
            {
              label: "Resolved",
              value: analytics.resolvedComplaints,
              color: "#059669",
              icon: <CheckCircle size={20} />,
            },
            {
              label: "SLA Breached",
              value: analytics.slaBreachedCount,
              color: "#dc2626",
              icon: <AlertCircle size={20} />,
            },
            {
              label: "Avg Resolution",
              value: `${analytics.avgResolutionHours?.toFixed(1)}h`,
              color: "#7c3aed",
              icon: <Clock size={20} />,
            },
            {
              label: "Success Rate",
              value: `${analytics.resolutionRate?.toFixed(1)}%`,
              color: "#065f46",
              icon: <TrendingUp size={20} />,
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "#fff",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                border: "1px solid #f3f4f6",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: `${s.color}15`,
                    color: s.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {s.icon}
                </div>
              </div>
              <div
                style={{ fontSize: "28px", fontWeight: 800, color: "#111827" }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  fontWeight: 700,
                  marginTop: "4px",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}

          {analytics.byStatus && (
            <div
              style={{
                gridColumn: "1/-1",
                background: "#fff",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                border: "1px solid #f3f4f6",
              }}
            >
              <h3
                style={{
                  margin: "0 0 20px",
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#111827",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <PieChart size={18} /> Breakdown by Status
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {Object.entries(analytics.byStatus).map(([k, v]) => {
                  const cfg = STATUS_COLOR[k] || {
                    bg: "#f3f4f6",
                    color: "#374151",
                    label: k,
                    icon: null,
                  };
                  return (
                    <div
                      key={k}
                      style={{
                        background: cfg.bg,
                        color: cfg.color,
                        padding: "10px 16px",
                        borderRadius: "12px",
                        fontSize: "13px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {cfg.icon} {cfg.label}:{" "}
                      <span style={{ fontSize: "15px" }}>{v}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* REGISTER STAFF TAB */}
      {activeTab === "register" && (
        <div
          style={{
            background: "#fff",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
            maxWidth: "650px",
            border: "1px solid #f3f4f6",
          }}
        >
          <h2
            style={{
              margin: "0 0 8px",
              fontSize: "24px",
              fontWeight: 800,
              color: "#111827",
            }}
          >
            Onboard Official Staff
          </h2>
          <p
            style={{
              margin: "0 0 32px",
              color: "#6b7280",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Create secure access for Ward Members and administrative oversight.
          </p>

          {regStatus.error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fee2e2",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "24px",
                fontSize: "14px",
                color: "#b91c1c",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <AlertCircle size={18} /> {regStatus.error}
            </div>
          )}
          {regStatus.success && (
            <div
              style={{
                background: "#ecfdf5",
                border: "1px solid #d1fae5",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "24px",
                fontSize: "14px",
                color: "#065f46",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <CheckCircle size={18} /> {regStatus.success}
            </div>
          )}

          {regStatus.walletInfo && regStatus.walletInfo.privateKey && (
            <div
              style={{
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "32px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "16px",
                  color: "#0369a1",
                }}
              >
                <ShieldCheck size={20} />
                <strong style={{ fontSize: "16px" }}>
                  Blockchain Wallet Created
                </strong>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#64748b",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Wallet ID (Public Address)
                </label>
                <div
                  style={{
                    background: "#fff",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontFamily: "monospace",
                    fontSize: "13px",
                    color: "#1e293b",
                  }}
                >
                  {regStatus.walletInfo.address}
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#e11d48",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Secret Private Key (Copy & Send to User!)
                </label>
                <div
                  style={{
                    background: "#fff",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #fda4af",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    color: "#be123c",
                    wordBreak: "break-all",
                  }}
                >
                  {regStatus.walletInfo.privateKey}
                </div>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    marginTop: "8px",
                    fontStyle: "italic",
                  }}
                >
                  * This key is required for digital signatures. It will never
                  be shown again.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              <div>
                <label style={labelStyle}>USERNAME / உள்நுழைவு பெயர்</label>
                <input
                  required
                  value={regForm.username}
                  onChange={(e) =>
                    setRegForm({ ...regForm, username: e.target.value })
                  }
                  placeholder="e.g. ward01_admin"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>PASSWORD / கடவுச்சொல்</label>
                <input
                  required
                  type="password"
                  value={regForm.password}
                  onChange={(e) =>
                    setRegForm({ ...regForm, password: e.target.value })
                  }
                  placeholder="••••••••"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>FULL NAME / பெயர்</label>
              <input
                required
                value={regForm.fullName}
                onChange={(e) =>
                  setRegForm({ ...regForm, fullName: e.target.value })
                }
                placeholder="Official Full Name"
                style={inputStyle}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              <div>
                <label style={labelStyle}>PHONE / தொலைபேசி</label>
                <input
                  required
                  value={regForm.phone}
                  onChange={(e) =>
                    setRegForm({ ...regForm, phone: e.target.value })
                  }
                  placeholder="+91 00000 00000"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>ASSIGNED ROLE / பதவி</label>
                <select
                  value={regForm.role}
                  onChange={(e) =>
                    setRegForm({ ...regForm, role: e.target.value })
                  }
                  style={{ ...inputStyle, height: "46px" }}
                >
                  <option value="WARD_MEMBER">Ward Member</option>
                  <option value="PRESIDENT">President</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>

            {regForm.role === "WARD_MEMBER" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  marginBottom: "32px",
                  padding: "20px",
                  background: "#f9fafb",
                  borderRadius: "16px",
                }}
              >
                <div>
                  <label style={labelStyle}>WARD ID / வார்டு எண்</label>
                  <select
                    required
                    value={regForm.wardId}
                    onChange={(e) =>
                      setRegForm({ ...regForm, wardId: e.target.value })
                    }
                    style={{
                      ...inputStyle,
                      background: "#fff",
                      height: "46px",
                    }}
                  >
                    <option value="">Select Ward...</option>
                    <option value="WARD-01">WARD-01</option>
                    <option value="WARD-02">WARD-02</option>
                    <option value="WARD-03">WARD-03</option>
                    <option value="WARD-04">WARD-04</option>
                    <option value="WARD-05">WARD-05</option>
                    <option value="WARD-06">WARD-06</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>WARD NAME / வார்டு பெயர்</label>
                  <input
                    value={regForm.wardName}
                    onChange={(e) =>
                      setRegForm({ ...regForm, wardName: e.target.value })
                    }
                    placeholder="e.g. Main Street North"
                    style={{ ...inputStyle, background: "#fff" }}
                  />
                </div>
              </div>
            )}

            <button
              disabled={regStatus.loading}
              style={{
                width: "100%",
                padding: "16px",
                background: "#1d4ed8",
                color: "#fff",
                border: "none",
                borderRadius: "14px",
                fontSize: "15px",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 10px 20px rgba(29, 78, 216, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              {regStatus.loading ? (
                <RefreshCw size={18} className="spin" />
              ) : (
                <Plus size={18} />
              )}
              {regStatus.loading
                ? "Creating Member..."
                : "Create Staff Account"}
            </button>
          </form>

          {/* Staff List Table */}
          <div style={{ marginTop: "60px" }}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 800,
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <LayoutList size={20} color="#1d4ed8" /> Active Staff & Blockchain
              Status
            </h3>

            {staffLoading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <RefreshCw className="spin" size={24} />
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: "600px",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                          fontSize: "12px",
                          color: "#64748b",
                        }}
                      >
                        NAME / ROLE
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                          fontSize: "12px",
                          color: "#64748b",
                        }}
                      >
                        WALLET ADDRESS
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                          fontSize: "12px",
                          color: "#64748b",
                        }}
                      >
                        STATUS
                      </th>
                      <th
                        style={{
                          textAlign: "right",
                          padding: "12px",
                          fontSize: "12px",
                          color: "#64748b",
                        }}
                      >
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffList.map((s) => (
                      <tr
                        key={s.userId}
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        <td style={{ padding: "16px 12px" }}>
                          <div style={{ fontWeight: 700, fontSize: "14px" }}>
                            {s.fullName}
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            {s.role} {s.wardId ? `• ${s.wardId}` : ""}
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "16px 12px",
                            fontFamily: "monospace",
                            fontSize: "12px",
                          }}
                        >
                          {s.walletAddress ? (
                            <span style={{ color: "#0f172a" }}>
                              {s.walletAddress.slice(0, 8)}...
                              {s.walletAddress.slice(-4)}
                            </span>
                          ) : (
                            <span
                              style={{ color: "#94a3b8", fontStyle: "italic" }}
                            >
                              Not generated
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "16px 12px" }}>
                          {s.walletStatus === "PENDING" ? (
                            <span
                              style={{
                                padding: "4px 8px",
                                background: "#fef3c7",
                                color: "#92400e",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            >
                              IDENTITY PENDING
                            </span>
                          ) : (
                            <span
                              style={{
                                padding: "4px 8px",
                                background: "#dcfce7",
                                color: "#166534",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            >
                              IDENTITY READY
                            </span>
                          )}
                        </td>
                        <td
                          style={{ padding: "16px 12px", textAlign: "right" }}
                        >
                          {s.walletStatus === "PENDING" ? (
                            <button
                              onClick={() => {
                                const link = `${window.location.origin}/setup-wallet?token=${s.walletSetupToken}`;
                                navigator.clipboard.writeText(link);
                                alert(
                                  "Setup link copied! Send this to " +
                                    s.fullName,
                                );
                              }}
                              style={{
                                padding: "6px 12px",
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              Copy Setup Link
                            </button>
                          ) : (
                            <button
                              disabled={blockchainRegLoading === s.userId}
                              onClick={() => registerOnChain(s)}
                              style={{
                                padding: "6px 12px",
                                background: "#000b60",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontWeight: 700,
                                cursor: "pointer",
                                opacity:
                                  blockchainRegLoading === s.userId ? 0.6 : 1,
                              }}
                            >
                              {blockchainRegLoading === s.userId
                                ? "Registering..."
                                : "Activate On Blockchain"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "blockchain" && (
        <div style={{ padding: "20px 0" }}>
          <GenesisLedger />
        </div>
      )}

      {/* MODALS */}
      {assignModal && (
        <AssignModal
          complaint={assignModal}
          onClose={() => setAssignModal(null)}
          onSubmit={(name) => doAssign(assignModal.id, name)}
          loading={actionLoading}
          error={actionError}
        />
      )}

      {commentModal && (
        <CommentModal
          complaint={commentModal}
          onClose={() => setCommentModal(null)}
          onSubmit={(msg, pub) => doComment(commentModal.id, msg, pub)}
          loading={actionLoading}
          error={actionError}
        />
      )}

      {progressModal && (
        <ProgressModal
          complaint={progressModal}
          onClose={() => setProgressModal(null)}
          onSubmit={(status, notes, remarks) =>
            doProgress(progressModal.id, status, notes, remarks)
          }
          loading={actionLoading}
          error={actionError}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}

function ProgressModal({ complaint, onClose, onSubmit, loading, error }) {
  const nextStatuses = ["IN_PROGRESS", "RESOLVED"];
  const [status, setStatus] = useState(nextStatuses[0]);
  const [notes, setNotes] = useState("");
  const [remarks, setRemarks] = useState("");

  return (
    <Modal
      title={`Update Progress — ${complaint.complaintNumber}`}
      onClose={onClose}
    >
      {error && (
        <div
          style={{
            background: "#fee2e2",
            borderRadius: "8px",
            padding: "10px",
            marginBottom: "16px",
            fontSize: "13px",
            color: "#dc2626",
          }}
        >
          {error}
        </div>
      )}
      <div style={{ marginBottom: "20px" }}>
        <label style={labelStyle}>NEW STATUS</label>
        <div style={{ display: "flex", gap: "12px" }}>
          {nextStatuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "12px",
                border: `2px solid ${status === s ? "#f59e0b" : "#f3f4f6"}`,
                background: status === s ? "#fffbeb" : "#f9fafb",
                color: status === s ? "#92400e" : "#4b5563",
                cursor: "pointer",
                fontWeight: 800,
                fontFamily: "inherit",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {s === "IN_PROGRESS" ? (
                <Activity size={14} />
              ) : (
                <CheckCircle size={14} />
              )}
              {s === "IN_PROGRESS" ? "In Progress" : "Resolved"}
            </button>
          ))}
        </div>
      </div>
      {status === "RESOLVED" && (
        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>RESOLUTION NOTES *</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Describe the resolution steps taken..."
            style={{ ...inputStyle, resize: "none" }}
          />
        </div>
      )}
      <div style={{ marginBottom: "24px" }}>
        <label style={labelStyle}>REMARKS (OPTIONAL)</label>
        <input
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Internal remarks..."
          style={inputStyle}
        />
      </div>
      <button
        onClick={() => onSubmit(status, notes, remarks)}
        disabled={loading || (status === "RESOLVED" && !notes.trim())}
        style={{
          width: "100%",
          padding: "14px",
          background: "#f59e0b",
          color: "#fff",
          border: "none",
          borderRadius: "12px",
          cursor: "pointer",
          fontWeight: 800,
          fontFamily: "inherit",
          fontSize: "15px",
        }}
      >
        {loading ? "Updating..." : "Confirm Update"}
      </button>
    </Modal>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "11px",
  fontWeight: 800,
  color: "#9ca3af",
  marginBottom: "8px",
  letterSpacing: "0.5px",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  fontSize: "14px",
  outline: "none",
  fontFamily: "inherit",
  color: "#111827",
  boxSizing: "border-box",
  background: "#f9fafb",
};

function ActionBtn({ children, onClick, color, bg }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 16px",
        background: bg,
        color,
        border: "none",
        borderRadius: "10px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: 700,
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      {children}
    </button>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(17, 24, 39, 0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "28px",
          padding: "32px",
          width: "100%",
          maxWidth: "500px",
          boxShadow: "0 40px 100px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "28px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: 800,
              color: "#111827",
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "#f3f4f6",
              border: "none",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            <XCircle size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function VerifyModal({ complaint, onClose, onSubmit, loading, error }) {
  const [approved, setApproved] = useState(true);
  const [reason, setReason] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  return (
    <Modal
      title={`Resolution Verification — ${complaint.complaintNumber}`}
      onClose={onClose}
    >
      {error && (
        <div
          style={{
            background: "#fef2f2",
            borderRadius: "10px",
            padding: "12px",
            marginBottom: "16px",
            fontSize: "14px",
            color: "#b91c1c",
          }}
        >
          {error}
        </div>
      )}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        {[true, false].map((v) => (
          <button
            key={String(v)}
            onClick={() => setApproved(v)}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "14px",
              border: "2px solid",
              borderColor:
                approved === v ? (v ? "#10b981" : "#ef4444") : "#f3f4f6",
              background:
                approved === v ? (v ? "#ecfdf5" : "#fef2f2") : "#f9fafb",
              color: approved === v ? (v ? "#065f46" : "#b91c1c") : "#64748b",
              cursor: "pointer",
              fontWeight: 800,
              fontFamily: "inherit",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {v ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {v ? "Approve" : "Reject"}
          </button>
        ))}
      </div>
      {approved && (
        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>ASSIGN PRIORITY / முன்னுரிமை</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={{ ...inputStyle, height: "46px" }}
          >
            <option value="URGENT">🔴 URGENT (24h SLA)</option>
            <option value="NORMAL">🔵 NORMAL (72h SLA)</option>
            <option value="LOW">⚪ LOW (7 Days SLA)</option>
          </select>
        </div>
      )}
      {!approved && (
        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>REJECTION REASON * / காரணம்</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Provide specific feedback to the citizen..."
            style={{ ...inputStyle, resize: "none" }}
          />
        </div>
      )}
      <button
        onClick={() => onSubmit(approved, reason, priority)}
        disabled={loading || (!approved && !reason.trim())}
        style={{
          width: "100%",
          padding: "16px",
          background: approved ? "#10b981" : "#dc2626",
          color: "#fff",
          border: "none",
          borderRadius: "14px",
          cursor: "pointer",
          fontWeight: 800,
          fontFamily: "inherit",
          fontSize: "15px",
        }}
      >
        {loading
          ? "Processing..."
          : approved
            ? "Verify & Schedule"
            : "Reject Complaint"}
      </button>
    </Modal>
  );
}

function AssignModal({ complaint, onClose, onSubmit, loading, error }) {
  const [name, setName] = useState("");
  return (
    <Modal
      title={`Assign Official — ${complaint.complaintNumber}`}
      onClose={onClose}
    >
      {error && (
        <div
          style={{
            background: "#fef2f2",
            borderRadius: "10px",
            padding: "12px",
            marginBottom: "16px",
            fontSize: "14px",
            color: "#b91c1c",
          }}
        >
          {error}
        </div>
      )}
      <label style={labelStyle}>OFFICIAL/TECHNICIAN NAME</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full name of assigned official..."
        style={{ ...inputStyle, marginBottom: "24px" }}
      />
      <button
        onClick={() => onSubmit(name)}
        disabled={loading || !name.trim()}
        style={{
          width: "100%",
          padding: "16px",
          background: "#7c3aed",
          color: "#fff",
          border: "none",
          borderRadius: "14px",
          cursor: "pointer",
          fontWeight: 800,
          fontFamily: "inherit",
          fontSize: "15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <UserPlus size={18} /> {loading ? "Assigning..." : "Confirm Assignment"}
      </button>
    </Modal>
  );
}

function CommentModal({ complaint, onClose, onSubmit, loading, error }) {
  const [message, setMessage] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  return (
    <Modal
      title={`Collaboration Note — ${complaint.complaintNumber}`}
      onClose={onClose}
    >
      {error && (
        <div
          style={{
            background: "#fef2f2",
            borderRadius: "10px",
            padding: "12px",
            marginBottom: "16px",
            fontSize: "14px",
            color: "#b91c1c",
          }}
        >
          {error}
        </div>
      )}
      <label style={labelStyle}>NOTE MESSAGE</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        placeholder="Add context or internal updates..."
        style={{ ...inputStyle, resize: "none", marginBottom: "16px" }}
      />
      <div
        style={{
          padding: "16px",
          background: "#f9fafb",
          borderRadius: "14px",
          marginBottom: "24px",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
            color: "#374151",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            style={{ width: "18px", height: "18px" }}
          />
          Make this note Public
        </label>
        <p
          style={{ margin: "6px 0 0 28px", fontSize: "12px", color: "#6b7280" }}
        >
          If enabled, the citizen will be able to see this comment on their
          tracker.
        </p>
      </div>
      <button
        onClick={() => onSubmit(message, isPublic)}
        disabled={loading || !message.trim()}
        style={{
          width: "100%",
          padding: "16px",
          background: "#111827",
          color: "#fff",
          border: "none",
          borderRadius: "14px",
          cursor: "pointer",
          fontWeight: 800,
          fontFamily: "inherit",
          fontSize: "15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <MessageSquare size={18} />{" "}
        {loading ? "Posting..." : "Post Collaboration Note"}
      </button>
    </Modal>
  );
}
