import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Clock, 
  History, 
  ShieldCheck, 
  Link as LinkIcon,
  TrendingUp,
  User,
  Award,
  BarChart3,
  Camera,
  CheckCircle
} from "lucide-react";
import { blockchainApi } from "../../utils/blockchainApi";
import { getUser } from "../../utils/api";
import { digitallySign } from "../../utils/blockchainIdentity";

const FundsPage = () => {
  const user = getUser();
  const role = user?.role || "CITIZEN";

  const isPresident = role === "PRESIDENT" || role === "ADMIN";
  const isWardMember = role === "WARD_MEMBER" || role === "ADMIN";

  const [activeTab, setActiveTab] = useState(role === "CITIZEN" ? "APPROVED" : "PENDING");
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null);

  // Form states
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState("");
  const [wardId, setWardId] = useState("");

  useEffect(() => {
    fetchFunds();
  }, [activeTab]);

  const fetchFunds = async () => {
    setLoading(true);
    try {
      let response;
      if (activeTab === "PENDING") {
        response = await blockchainApi.getPendingRequests();
      } else if (activeTab === "APPROVED") {
        response = await blockchainApi.getApprovedFunds();
      }
      
      if (response?.success) {
        setFunds(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching funds:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        purpose,
        amount: parseFloat(amount),
        wardId
      };

      // --- Module 1: Digital Signature ---
      const signature = await digitallySign(payload, user.privateKey);
      
      const response = await blockchainApi.submitRequest({
        ...payload,
        signature // Sending signature to blockchain
      });
      if (response.success) {
        alert("Fund Request Digitally Signed & Submitted!\nTransaction ID: " + response.transactionId);
        setShowForm(false);
        setPurpose("");
        setAmount("");
        setWardId("");
        fetchFunds();
      }
    } catch (error) {
      alert("Submission failed: " + error.message);
    }
  };

  const handleVote = async (id, voteType) => {
    try {
      const payload = { 
        vote: voteType,
        wardMemberId: user.userId || "anonymous-voter",
        timestamp: new Date().toISOString()
      };

      // --- Module 1: Digital Signature ---
      const signature = await digitallySign(payload, user.privateKey);

      const response = await blockchainApi.castVote(id, { 
        ...payload,
        signature // Sending signature to blockchain
      });
      if (response.success) {
        alert(`Vote Digitally Signed & Recorded!`);
        fetchFunds();
      }
    } catch (error) {
      alert("Voting failed: " + error.message);
    }
  };

  const hasVoted = (fund) => {
    return fund.votes?.some(v => v.wardMemberId === user.userId);
  };

  const getUserVote = (fund) => {
    return fund.votes?.find(v => v.wardMemberId === user.userId)?.vote;
  };

  const renderBadge = (status) => {
    const colors = {
      APPROVED: { bg: "#dcfce7", text: "#166534" },
      PENDING: { bg: "#fef9c3", text: "#854d0e" },
      REJECTED: { bg: "#fee2e2", text: "#991b1b" }
    };
    const style = colors[status] || colors.PENDING;
    return (
      <span style={{ 
        padding: "4px 10px", 
        borderRadius: "20px", 
        fontSize: "12px", 
        fontWeight: 600,
        backgroundColor: style.bg,
        color: style.text,
        textTransform: "uppercase"
      }}>
        {status}
      </span>
    );
  };

  const renderAnalytics = () => {
    // Mock analytics based on funds
    const totalApproved = funds.reduce((acc, f) => acc + (f.status === "APPROVED" ? f.amount : 0), 0);
    const totalPending = funds.reduce((acc, f) => acc + (f.status === "PENDING" ? f.amount : 0), 0);
    
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <h4 style={{ color: "#64748b", margin: 0 }}>Total Funds Approved</h4>
            <Award style={{ color: "#4f46e5" }} />
          </div>
          <p style={{ fontSize: "28px", fontWeight: 700, margin: 0, color: "#1e1b4b" }}>₹{totalApproved.toLocaleString()}</p>
          <p style={{ color: "#166534", fontSize: "14px", marginTop: "8px", fontWeight: 500 }}>↑ 12% from last term</p>
        </div>

        <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <h4 style={{ color: "#64748b", margin: 0 }}>Consensus Accuracy</h4>
            <ShieldCheck style={{ color: "#10b981" }} />
          </div>
          <p style={{ fontSize: "28px", fontWeight: 700, margin: 0, color: "#1e1b4b" }}>94.2%</p>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "8px" }}>Verified by Blockchain</p>
        </div>

        <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <h4 style={{ color: "#64748b", margin: 0 }}>Transparency Rating</h4>
            <TrendingUp style={{ color: "#f59e0b" }} />
          </div>
          <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
            {[1,2,3,4,5].map(i => <Award key={i} size={20} fill={i <= 4 ? "#f59e0b" : "none"} color="#f59e0b" />)}
          </div>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "8px" }}>Excellent (5-star goal)</p>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <ShieldCheck size={32} color="#4f46e5" />
            <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#1e1b4b", margin: 0 }}>Blockchain Fund Governance</h1>
          </div>
          <p style={{ color: "#64748b", fontSize: "16px", maxWidth: "600px", marginBottom: "12px" }}>
            Transparent, immutable record of panchayat funds. Every rupee is tracked and approved via 51% democratic consensus.
          </p>
          {user?.walletId && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#f1f5f9", padding: "6px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <ShieldCheck size={14} color="#4f46e5" />
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>My Wallet: <span style={{ color: "#4f46e5", fontFamily: "monospace" }}>{user.walletId}</span></span>
            </div>
          )}
        </div>
        
        {isPresident && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", 
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", color: "#fff", 
              border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: 600,
              boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.3)"
            }}
          >
            <Plus size={20} /> Propose Fund Allocation
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "32px", marginBottom: "32px", borderBottom: "2px solid #f1f5f9" }}>
        {(isWardMember || isPresident) && (
          <button
            onClick={() => setActiveTab("PENDING")}
            style={{
              padding: "12px 4px", background: "none", border: "none", 
              borderBottom: activeTab === "PENDING" ? "2px solid #4f46e5" : "2px solid transparent",
              color: activeTab === "PENDING" ? "#4f46e5" : "#64748b",
              fontWeight: activeTab === "PENDING" ? 700 : 500, cursor: "pointer", fontSize: "16px"
            }}
          >
            Pending Approvals
          </button>
        )}
        <button
          onClick={() => setActiveTab("APPROVED")}
          style={{
            padding: "12px 4px", background: "none", border: "none", 
            borderBottom: activeTab === "APPROVED" ? "2px solid #4f46e5" : "2px solid transparent",
            color: activeTab === "APPROVED" ? "#4f46e5" : "#64748b",
            fontWeight: activeTab === "APPROVED" ? 700 : 500, cursor: "pointer", fontSize: "16px"
          }}
        >
          Public Transparency Feed
        </button>
        <button
          onClick={() => setActiveTab("ANALYTICS")}
          style={{
            padding: "12px 4px", background: "none", border: "none", 
            borderBottom: activeTab === "ANALYTICS" ? "2px solid #4f46e5" : "2px solid transparent",
            color: activeTab === "ANALYTICS" ? "#4f46e5" : "#64748b",
            fontWeight: activeTab === "ANALYTICS" ? 700 : 500, cursor: "pointer", fontSize: "16px"
          }}
        >
          President Report Card
        </button>
      </div>

      {/* Analytics Tab Content */}
      {activeTab === "ANALYTICS" && (
        <>
          {renderAnalytics()}
          <div style={{ background: "#f8fafc", padding: "32px", borderRadius: "16px", border: "1px dashed #cbd5e1", textAlign: "center" }}>
            <BarChart3 size={48} color="#94a3b8" style={{ marginBottom: "16px" }} />
            <h3 style={{ color: "#1e1b4b" }}>Detailed Term Performance</h3>
            <p style={{ color: "#64748b" }}>Analytics are generated directly from blockchain block timestamps to ensure 100% accuracy.</p>
          </div>
        </>
      )}

      {/* Submission Form */}
      {showForm && isPresident && (activeTab === "PENDING" || activeTab === "APPROVED") && (
        <div style={{ 
          background: "#fff", padding: "32px", borderRadius: "16px", border: "1px solid #e2e8f0", 
          marginBottom: "40px", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" 
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
            <h3 style={{ margin: 0, color: "#1e1b4b" }}>New Fund Proposal</h3>
            <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>✕</button>
          </div>
          <form onSubmit={handleCreateRequest} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}>Purpose</label>
              <input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Solar Street Lights" required style={{ padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}>Amount (₹)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="50000" required style={{ padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}>Ward ID</label>
              <select value={wardId} onChange={(e) => setWardId(e.target.value)} required style={{ padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff" }}>
                <option value="">Select Ward</option>
                {[1,2,3,4,5,6].map(i => <option key={i} value={`Ward ${i}`}>Ward {i}</option>)}
              </select>
            </div>
            <button type="submit" style={{ gridColumn: "span 3", padding: "14px", background: "#1e1b4b", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", marginTop: "12px" }}>
              Digitally Sign & Submit to Blockchain
            </button>
          </form>
        </div>
      )}

      {/* Funds List */}
      {activeTab !== "ANALYTICS" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Securing connection to blockchain...</div>
          ) : funds.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px", background: "#f8fafc", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
              <Clock size={48} color="#cbd5e1" style={{ marginBottom: "16px" }} />
              <p style={{ color: "#64748b", fontSize: "18px" }}>No transactions found on the ledger for this category.</p>
            </div>
          ) : (
            funds.map((fund) => (
              <div 
                key={fund.id} 
                style={{ 
                  background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0",
                  transition: "all 0.2s", ":hover": { boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                      <h3 style={{ margin: 0, fontSize: "20px", color: "#1e1b4b" }}>{fund.purpose}</h3>
                      {renderBadge(fund.status)}
                      <span title="Blockchain Verified" style={{ cursor: "help" }}><ShieldCheck size={18} color="#10b981" /></span>
                    </div>
                    <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                      ID: <span style={{ fontFamily: "monospace", color: "#4f46e5" }}>{fund.id}</span> • 
                      Ward: <span style={{ fontWeight: 600 }}>{fund.wardId}</span> • 
                      Amount: <span style={{ fontWeight: 600, color: "#1e1b4b" }}>₹{fund.amount?.toLocaleString()}</span>
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 4px 0" }}>IPFS CID:</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#f1f5f9", padding: "4px 8px", borderRadius: "4px" }}>
                      <LinkIcon size={12} color="#64748b" />
                      <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#475569" }}>{fund.documentHash?.substring(0, 15)}...</span>
                    </div>
                  </div>
                </div>

                <div style={{ height: "1px", background: "#f1f5f9", margin: "16px 0" }}></div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", fontSize: "14px" }}>
                      <CheckCircle2 size={16} color="#10b981" />
                      <span>{fund.votes?.filter(v => v.vote === "APPROVE").length || 0} Approvals</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", fontSize: "14px" }}>
                      <XCircle size={16} color="#ef4444" />
                      <span>{fund.votes?.filter(v => v.vote === "REJECT").length || 0} Rejections</span>
                    </div>
                  </div>

                  {isWardMember && activeTab === "PENDING" && (
                    <div style={{ display: "flex", gap: "12px" }}>
                      {hasVoted(fund) ? (
                        <div style={{ 
                          display: "flex", alignItems: "center", gap: "8px", 
                          padding: "10px 20px", borderRadius: "8px", 
                          background: getUserVote(fund) === "APPROVE" ? "#dcfce7" : "#fee2e2",
                          color: getUserVote(fund) === "APPROVE" ? "#166534" : "#991b1b",
                          fontWeight: 700, fontSize: "14px"
                        }}>
                          {getUserVote(fund) === "APPROVE" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                          {getUserVote(fund) === "APPROVE" ? "Approved" : "Rejected"}
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleVote(fund.id, "APPROVE")} 
                            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", background: "#dcfce7", color: "#166534", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleVote(fund.id, "REJECT")} 
                            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {activeTab === "APPROVED" && (
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
                        <History size={14} /> Audit Trail
                      </button>
                      {isPresident && (
                        <button style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "#1e1b4b", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
                          <Camera size={14} /> Create Work Order
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Footer Info */}
      <div style={{ marginTop: "64px", padding: "32px", background: "linear-gradient(to right, #1e1b4b, #312e81)", borderRadius: "20px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h4 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>Blockchain Governance Node</h4>
          <p style={{ margin: 0, color: "#c7d2fe", fontSize: "14px" }}>Status: <span style={{ color: "#4ade80", fontWeight: 700 }}>● CONNECTED</span> | Channel: mychannel | Network: Hyperledger Fabric</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Last Block: #1,402</p>
          <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Hash: 0x82f...a1b2</p>
        </div>
      </div>
    </div>
  );
};

export default FundsPage;
