import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../../utils/web3Config";
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp,
  ShieldCheck,
  RefreshCw
} from "lucide-react";

const STATUS_MAP = {
  0: { label: "PENDING",   color: "#f59e0b", bg: "#fefce8" },
  1: { label: "APPROVED",  color: "#16a34a", bg: "#f0fdf4" },
  2: { label: "REJECTED",  color: "#dc2626", bg: "#fef2f2" },
  3: { label: "COMPLETED", color: "#2563eb", bg: "#eff6ff" },
};

export default function AdminFundRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      // Use JsonRpcProvider for read-only access (no wallet needed)
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

      const all = await contract.getAllRequests();
      
      const formatted = all.map((r) => ({
        id: Number(r.id),
        transactionId: r.transactionId,
        requester: r.requester,
        amount: Number(r.amount),
        purpose: r.purpose,
        approveCount: Number(r.approveCount),
        rejectCount: Number(r.rejectCount),
        status: Number(r.status),
        timestamp: Number(r.timestamp),
        totalMembers: Number(r.totalMembers),
      }));

      // Sort by newest first
      formatted.sort((a, b) => b.timestamp - a.timestamp);
      setRequests(formatted);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to sync with blockchain ledger.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (ts) => {
    return new Date(ts * 1000).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "20px"
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#1e293b" }}>
            Blockchain Fund Proposals
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#64748b" }}>
            Audit all fund allocation requests submitted by the President.
          </p>
        </div>
        <button 
          onClick={loadRequests}
          style={{
            padding: "8px 16px",
            background: "#f1f5f9",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#475569"
          }}
        >
          <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh Sync
        </button>
      </div>

      {error && (
        <div style={{ 
          background: "#fef2f2", 
          padding: "16px", 
          borderRadius: "12px", 
          color: "#b91c1c",
          marginBottom: "20px",
          fontSize: "14px",
          fontWeight: 600,
          border: "1px solid #fecaca"
        }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
          <RefreshCw size={32} className="spin" style={{ marginBottom: "12px" }} />
          <p style={{ fontWeight: 600 }}>Syncing Ledger Data...</p>
        </div>
      ) : requests.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "80px 20px",
          background: "#f8fafc",
          borderRadius: "20px",
          border: "2px dashed #e2e8f0",
          color: "#94a3b8"
        }}>
          <FileText size={48} style={{ marginBottom: "16px", opacity: 0.3 }} />
          <p style={{ fontWeight: 700, margin: 0 }}>No fund requests found on-chain.</p>
        </div>
      ) : (
        <div style={{ 
          background: "white", 
          borderRadius: "20px", 
          border: "1px solid #f1f5f9",
          overflow: "hidden",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
              <tr>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>ID</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Purpose & Date</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Amount</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Vote Status</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Blockchain Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const status = STATUS_MAP[req.status] || { label: "UNKNOWN", color: "#64748b", bg: "#f1f5f9" };
                const threshold = Math.floor(req.totalMembers / 2) + 1;
                
                return (
                  <tr key={req.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{ fontWeight: 900, color: "#1e293b" }}>#{req.id}</span>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ fontWeight: 700, color: "#1e293b" }}>{req.purpose}</div>
                      <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{formatDate(req.timestamp)}</div>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ fontWeight: 800, color: "#0f172a" }}>₹{req.amount.toLocaleString()}</div>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#16a34a", fontWeight: 700, fontSize: "13px" }}>
                          <CheckCircle2 size={14} /> {req.approveCount}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#dc2626", fontWeight: 700, fontSize: "13px" }}>
                          <XCircle size={14} /> {req.rejectCount}
                        </div>
                        <div style={{ marginLeft: "4px", fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>
                          Quorum: {threshold}/{req.totalMembers}
                        </div>
                      </div>
                      {/* Mini Progress Bar */}
                      <div style={{ 
                        width: "120px", 
                        height: "4px", 
                        background: "#f1f5f9", 
                        borderRadius: "10px", 
                        marginTop: "8px",
                        overflow: "hidden",
                        display: "flex"
                      }}>
                        <div style={{ 
                          width: `${(req.approveCount / req.totalMembers) * 100}%`, 
                          background: "#16a34a" 
                        }} />
                        <div style={{ 
                          width: `${(req.rejectCount / req.totalMembers) * 100}%`, 
                          background: "#dc2626" 
                        }} />
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "100px",
                        fontSize: "11px",
                        fontWeight: 800,
                        background: status.bg,
                        color: status.color,
                        border: `1px solid ${status.color}22`
                      }}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
