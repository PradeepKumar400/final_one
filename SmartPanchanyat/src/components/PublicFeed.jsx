import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/web3Config";

const STATUS_MAP = {
  0: { label: "PENDING",   color: "#f59e0b", bg: "#fefce8" },
  1: { label: "APPROVED",  color: "#16a34a", bg: "#f0fdf4" },
  2: { label: "REJECTED",  color: "#dc2626", bg: "#fef2f2" },
  3: { label: "COMPLETED", color: "#2563eb", bg: "#eff6ff" },
};

export default function PublicFeed() {
  const [requests, setRequests]   = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [filter, setFilter]       = useState("ALL");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadFeed();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadFeed, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilter(filter);
  }, [requests, filter]);

  const loadFeed = async () => {
    try {
      // Read-only provider — no wallet needed for public feed
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS, CONTRACT_ABI, provider
      );

      const all = await contract.getAllRequests();

      // Convert BigInt values to readable format
      const formatted = all.map((r) => ({
        id:           Number(r.id),
        transactionId: r.transactionId,
        requester:    r.requester,
        amount:       Number(r.amount),
        purpose:      r.purpose,
        approveCount: Number(r.approveCount),
        rejectCount:  Number(r.rejectCount),
        status:       Number(r.status),
        timestamp:    Number(r.timestamp),
        totalMembers: Number(r.totalMembers),
        ipfsHash:     r.workOrderIpfsHash,
      }));

      // Sort newest first
      formatted.sort((a, b) => b.timestamp - a.timestamp);

      setRequests(formatted);
      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      setError("Unable to connect to blockchain. Make sure Hardhat node is running.");
    }
    setLoading(false);
  };

  const applyFilter = (f) => {
    if (f === "ALL") {
      setFiltered(requests);
    } else {
      const statusCode = { PENDING: 0, APPROVED: 1, REJECTED: 2, COMPLETED: 3 };
      setFiltered(requests.filter(r => r.status === statusCode[f]));
    }
    setFilter(f);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  const formatAmount = (amount) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} Lakh`;
    if (amount >= 1000)   return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  const getVoteBar = (req) => {
    const total = req.totalMembers;
    const approvePercent = total > 0 ? (req.approveCount / total) * 100 : 0;
    const rejectPercent  = total > 0 ? (req.rejectCount  / total) * 100 : 0;
    return { approvePercent, rejectPercent };
  };

  // ── Summary counts ──
  const counts = {
    ALL:       requests.length,
    PENDING:   requests.filter(r => r.status === 0).length,
    APPROVED:  requests.filter(r => r.status === 1).length,
    REJECTED:  requests.filter(r => r.status === 2).length,
    COMPLETED: requests.filter(r => r.status === 3).length,
  };

  return (
    <div style={{ 
      maxWidth: 900, 
      margin: "75px auto", 
      padding: "0 24px",
      fontFamily: "'Manrope', sans-serif"
    }}>

      {/* ── Header ── */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h1 style={{ margin: "0 0 12px", fontSize: 32, fontWeight: 900, color: "#0f172a" }}>
          🏛️ GramaNiti — Public Fund Ledger
        </h1>
        <p style={{ color: "#64748b", fontSize: "16px", maxWidth: 600, margin: "0 auto 16px", lineHeight: 1.6 }}>
          All panchayat fund requests are recorded permanently on the blockchain. 
          This ledger is tamper-proof and publicly verifiable.
        </p>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "#f0fdf4", border: "1.5px solid #86efac",
          borderRadius: 100, padding: "8px 20px", fontSize: 13
        }}>
          <span style={{ color: "#16a34a", fontSize: "16px" }}>⛓️</span>
          <span style={{ color: "#166534", fontWeight: 800 }}>
            Verified Blockchain Sync Active
          </span>
          {lastUpdated && (
            <span style={{ color: "#64748b", fontWeight: 500 }}>
              · Last Sync: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* ── Summary Grid ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 20, marginBottom: 40
      }}>
        {[
          { label: "Total Ledger", value: counts.ALL,       color: "#4f46e5", bg: "#eef2ff" },
          { label: "Awaiting Vote", value: counts.PENDING,   color: "#d97706", bg: "#fffbeb" },
          { label: "Member Approved", value: counts.APPROVED,  color: "#16a34a", bg: "#f0fdf4" },
          { label: "Fully Completed", value: counts.COMPLETED, color: "#2563eb", bg: "#eff6ff" },
        ].map((card) => (
          <div key={card.label} style={{
            background: card.bg, borderRadius: 20, border: `1px solid ${card.color}22`,
            padding: "24px 20px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
          }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginTop: 4 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{
        display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap", justifyContent: "center"
      }}>
        {["ALL", "PENDING", "APPROVED", "REJECTED", "COMPLETED"].map((f) => (
          <button
            key={f}
            onClick={() => applyFilter(f)}
            style={{
              padding: "10px 20px", borderRadius: 100, border: "none",
              cursor: "pointer", fontWeight: 800, fontSize: "12px",
              background: filter === f ? "#0f172a" : "#f1f5f9",
              color: filter === f ? "white" : "#64748b",
              transition: "all 0.2s"
            }}
          >
            {f} ({counts[f] ?? 0})
          </button>
        ))}
      </div>

      {/* ── Status Messages ── */}
      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fca5a5",
          borderRadius: 16, padding: 20, color: "#b91c1c",
          marginBottom: 32, textAlign: "center", fontWeight: 600
        }}>
          ⚠️ {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
          <div className="spin" style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
          <p style={{ fontWeight: 700 }}>Connecting to GramaNiti Ledger...</p>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{
          textAlign: "center", padding: 80,
          border: "2px dashed #e2e8f0", borderRadius: 24, color: "#94a3b8",
          background: "#f8fafc"
        }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "18px" }}>No matching records found</p>
          <p style={{ margin: "8px 0 0", fontSize: "14px" }}>The blockchain is waiting for the next fund request.</p>
        </div>
      )}

      {/* ── Request Cards ── */}
      <div style={{ display: "grid", gap: 24 }}>
        {filtered.map((req) => {
          const statusInfo = STATUS_MAP[req.status];
          const { approvePercent, rejectPercent } = getVoteBar(req);

          return (
            <div key={req.id} style={{
              border: "1px solid #e2e8f0", borderRadius: 24,
              padding: 28, background: "white",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
              position: "relative", overflow: "hidden"
            }}>
              {/* Status Side Accent */}
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, background: statusInfo.color }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>
                    BLOCK RECORD #{req.id} · {formatDate(req.timestamp)}
                  </div>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1e293b" }}>{req.purpose}</h3>
                </div>
                <div style={{
                  background: statusInfo.bg, color: statusInfo.color,
                  border: `1.5px solid ${statusInfo.color}44`,
                  borderRadius: 100, padding: "6px 16px",
                  fontSize: 12, fontWeight: 800, whiteSpace: "nowrap"
                }}>
                  {statusInfo.label}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                <div style={{ background: "#f8fafc", borderRadius: 16, padding: 16, border: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Fund Amount</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a" }}>{formatAmount(req.amount)}</div>
                </div>
                <div style={{ background: "#f8fafc", borderRadius: 16, padding: 16, border: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Originator (President)</div>
                  <code style={{ fontSize: "11px", color: "#475569", wordBreak: "break-all" }}>{req.requester}</code>
                </div>
              </div>

              {/* Vote Visualization */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                  <span style={{ color: "#16a34a" }}>✅ {req.approveCount} APPROVED</span>
                  <span style={{ color: "#64748b" }}>QUORUM: {req.totalMembers} MEMBERS</span>
                  <span style={{ color: "#dc2626" }}>❌ {req.rejectCount} REJECTED</span>
                </div>
                <div style={{ height: 12, background: "#f1f5f9", borderRadius: 100, overflow: "hidden", display: "flex" }}>
                  <div style={{ width: `${approvePercent}%`, background: "#16a34a", transition: "width 0.5s ease-out" }} />
                  <div style={{ width: `${rejectPercent}%`, background: "#dc2626", transition: "width 0.5s ease-out" }} />
                </div>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: 8, fontWeight: 600 }}>
                  Blockchain Rule: 51% majority (minimum {Math.floor(req.totalMembers / 2) + 1} votes) required for approval.
                </div>
              </div>

              {/* Technical Proof */}
              <div style={{
                background: "#f8fafc", borderRadius: 12, padding: "12px 16px", 
                fontSize: "11px", color: "#64748b", display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontWeight: 800 }}>⛓️ TX:</span> 
                  <code style={{ background: "#fff", padding: "2px 6px", borderRadius: 4, border: "1px solid #e2e8f0" }}>{req.transactionId}</code>
                </span>
                {req.ipfsHash && (
                  <span style={{ color: "#2563eb", fontWeight: 800 }}>📄 IPFS PROOF ATTACHED</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
