import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../../utils/web3Config";
import { Plus, ShieldCheck, CheckCircle2, XCircle, Clock } from "lucide-react";

const STATUS_COLORS = {
  PENDING:   { bg: "#fef3c7", color: "#92400e" },
  APPROVED:  { bg: "#dcfce7", color: "#166534" },
  REJECTED:  { bg: "#fee2e2", color: "#991b1b" },
  COMPLETED: { bg: "#dbeafe", color: "#1e40af" },
};

const STATUS_MAP = ["PENDING", "APPROVED", "REJECTED", "COMPLETED"];

export default function FundRequestPanel({ currentUser }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState("");
  const [wardId, setWardId] = useState("");

  useEffect(() => {
    initWeb3();
  }, []);

  const initWeb3 = async () => {
    setLoading(true);
    try {
      // Load requests read-only first
      const readProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const readContract = new ethers.Contract(
        CONTRACT_ADDRESS, CONTRACT_ABI, readProvider
      );
      await fetchRequests(readContract);

      // Connect wallet for creating requests
      if (!window.ethereum) return;

      await window.ethereum.request({ method: "eth_requestAccounts" });

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x7A69" }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: "0x7A69",
              chainName: "Hardhat Local",
              rpcUrls: ["http://127.0.0.1:8545"],
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            }],
          });
        }
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setCurrentAccount(address);

      const writeContract = new ethers.Contract(
        CONTRACT_ADDRESS, CONTRACT_ABI, signer
      );
      setContract(writeContract);
      setWalletConnected(true);
      await fetchRequests(writeContract);
    } catch (err) {
      console.error("Web3 init failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async (c) => {
    try {
      const raw = await c.getAllRequests();
      setRequests(raw.map(r => ({
        id:           Number(r.id),
        transactionId: r.transactionId,
        requester:    r.requester,
        amount:       Number(r.amount),
        purpose:      r.purpose,
        approveCount: Number(r.approveCount),
        rejectCount:  Number(r.rejectCount),
        status:       STATUS_MAP[Number(r.status)],
        timestamp:    Number(r.timestamp),
        totalMembers: Number(r.totalMembers),
      })));
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!contract || !walletConnected) {
      alert("Please connect your MetaMask wallet first.");
      return;
    }
    setLoading(true);
    try {
      const txId = "TX-" + Math.floor(Math.random() * 1000000);
      const totalMembers = 6;

      const tx = await contract.createRequest(
        txId,
        ethers.parseUnits(amount, "wei"),
        purpose,
        BigInt(totalMembers)
      );
      await tx.wait();

      alert(`✅ Fund Request Digitally Signed & Submitted to Ethereum!\nTransaction ID: ${txId}`);
      setShowForm(false);
      setPurpose("");
      setAmount("");
      setWardId("");
      await fetchRequests(contract);
    } catch (err) {
      if (err.message.includes("Only registered President")) {
        alert("❌ Action Denied: Your MetaMask account is not registered as a President on the blockchain.");
      } else if (err.message.includes("No ward members")) {
        alert("❌ No ward members registered yet. Admin must activate ward members first.");
      } else {
        alert("Submission failed: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Only show requests created by this president
  const myRequests = requests.filter(
    r => r.requester.toLowerCase() === currentAccount.toLowerCase()
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 800, color: "#111827" }}>
            Fund Requests
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
            Create and track fund allocation requests. Each request is voted on by ward members.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {walletConnected && (
            <div style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "#f0fdf4", border: "1px solid #86efac",
              padding: "6px 12px", borderRadius: "8px", fontSize: "12px"
            }}>
              <ShieldCheck size={14} color="#16a34a" />
              <span style={{ color: "#166534", fontWeight: 700 }}>
                {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
              </span>
            </div>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "10px 20px",
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              color: "#fff", border: "none", borderRadius: "10px",
              cursor: "pointer", fontWeight: 700, fontSize: "13px",
              display: "flex", alignItems: "center", gap: "8px",
              boxShadow: "0 4px 12px rgba(79,70,229,0.3)"
            }}
          >
            <Plus size={16} />
            {showForm ? "Cancel" : "New Fund Request"}
          </button>
        </div>
      </div>

      {/* Create Request Form */}
      {showForm && (
        <div style={{
          background: "#fff", borderRadius: "20px", padding: "28px",
          border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
        }}>
          <h3 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: 800, color: "#1e1b4b" }}>
            New Fund Proposal
          </h3>
          <p style={{ margin: "0 0 24px", fontSize: "13px", color: "#64748b" }}>
            This request will be sent to all ward members for voting. 
            Requires 51% approval to be authorized.
          </p>

          <form onSubmit={handleCreateRequest}>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
              gap: "16px", marginBottom: "20px"
            }}>
              <div>
                <label style={{
                  display: "block", fontSize: "11px", fontWeight: 800,
                  color: "#64748b", marginBottom: "8px", textTransform: "uppercase"
                }}>
                  Purpose
                </label>
                <input
                  required
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  placeholder="e.g. Solar Street Lights"
                  style={{
                    width: "100%", padding: "12px", borderRadius: "10px",
                    border: "1px solid #e2e8f0", fontSize: "14px",
                    boxSizing: "border-box", outline: "none", background: "#f8fafc"
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: "block", fontSize: "11px", fontWeight: 800,
                  color: "#64748b", marginBottom: "8px", textTransform: "uppercase"
                }}>
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="e.g. 500000"
                  style={{
                    width: "100%", padding: "12px", borderRadius: "10px",
                    border: "1px solid #e2e8f0", fontSize: "14px",
                    boxSizing: "border-box", outline: "none", background: "#f8fafc"
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: "block", fontSize: "11px", fontWeight: 800,
                  color: "#64748b", marginBottom: "8px", textTransform: "uppercase"
                }}>
                  Ward
                </label>
                <select
                  required
                  value={wardId}
                  onChange={e => setWardId(e.target.value)}
                  style={{
                    width: "100%", padding: "12px", borderRadius: "10px",
                    border: "1px solid #e2e8f0", fontSize: "14px",
                    boxSizing: "border-box", outline: "none",
                    background: "#f8fafc", cursor: "pointer"
                  }}
                >
                  <option value="">Select Ward</option>
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <option key={i} value={`Ward ${i}`}>Ward {i}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "14px",
                background: loading ? "#ccc" : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                color: "#fff", border: "none", borderRadius: "10px",
                fontWeight: 800, cursor: loading ? "wait" : "pointer", fontSize: "14px"
              }}
            >
              {loading ? "Submitting to Blockchain..." : "✍️ Digitally Sign & Submit to Blockchain"}
            </button>
          </form>
        </div>
      )}

      {/* Summary */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px"
      }}>
        {[
          { label: "Total", value: myRequests.length, color: "#4f46e5", bg: "#eef2ff" },
          { label: "Pending", value: myRequests.filter(r => r.status === "PENDING").length, color: "#d97706", bg: "#fffbeb" },
          { label: "Approved", value: myRequests.filter(r => r.status === "APPROVED").length, color: "#059669", bg: "#ecfdf5" },
          { label: "Rejected", value: myRequests.filter(r => r.status === "REJECTED").length, color: "#dc2626", bg: "#fef2f2" },
        ].map(card => (
          <div key={card.label} style={{
            background: card.bg, borderRadius: "14px", padding: "16px",
            textAlign: "center", border: `1px solid ${card.color}22`
          }}>
            <div style={{ fontSize: "24px", fontWeight: 900, color: card.color }}>
              {card.value}
            </div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginTop: "4px" }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Requests List */}
      {loading && !showForm ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
          Loading from blockchain...
        </div>
      ) : myRequests.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px",
          border: "2px dashed #e2e8f0", borderRadius: "20px",
          background: "#f8fafc", color: "#94a3b8"
        }}>
          <Clock size={40} style={{ marginBottom: "12px", opacity: 0.4 }} />
          <p style={{ margin: 0, fontWeight: 700 }}>No fund requests yet.</p>
          <p style={{ margin: "6px 0 0", fontSize: "13px" }}>
            Click "New Fund Request" to propose fund allocation.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {myRequests.map(req => {
            const sc = STATUS_COLORS[req.status] || STATUS_COLORS.PENDING;
            const threshold = Math.floor(req.totalMembers / 2) + 1;
            const approvePercent = req.totalMembers > 0
              ? (req.approveCount / req.totalMembers) * 100 : 0;
            const rejectPercent = req.totalMembers > 0
              ? (req.rejectCount / req.totalMembers) * 100 : 0;

            return (
              <div key={req.id} style={{
                background: "#fff", borderRadius: "18px", padding: "22px",
                border: "1px solid #f1f5f9",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                borderLeft: `4px solid ${sc.color}`
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", marginBottom: "16px"
                }}>
                  <div>
                    <div style={{
                      fontSize: "11px", color: "#94a3b8", fontWeight: 700,
                      textTransform: "uppercase", marginBottom: "6px"
                    }}>
                      Request #{req.id} · {new Date(req.timestamp * 1000).toLocaleString("en-IN")}
                    </div>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#1e293b" }}>
                      {req.purpose}
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                      Amount: <strong>₹{req.amount.toLocaleString()}</strong>
                      {" · "}TX: <code style={{ fontSize: "11px" }}>{req.transactionId}</code>
                    </div>
                  </div>
                  <span style={{
                    padding: "6px 14px", borderRadius: "100px",
                    fontSize: "11px", fontWeight: 800,
                    background: sc.bg, color: sc.color
                  }}>
                    {req.status}
                  </span>
                </div>

                {/* Vote progress */}
                <div style={{
                  background: "#f8fafc", borderRadius: "12px", padding: "14px"
                }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    fontSize: "12px", fontWeight: 700, marginBottom: "8px"
                  }}>
                    <span style={{ color: "#16a34a", display: "flex", alignItems: "center", gap: "4px" }}>
                      <CheckCircle2 size={14} /> {req.approveCount} Approved
                    </span>
                    <span style={{ color: "#64748b" }}>
                      Needs {threshold} of {req.totalMembers} votes
                    </span>
                    <span style={{ color: "#dc2626", display: "flex", alignItems: "center", gap: "4px" }}>
                      <XCircle size={14} /> {req.rejectCount} Rejected
                    </span>
                  </div>
                  <div style={{
                    height: "8px", background: "#e2e8f0",
                    borderRadius: "100px", overflow: "hidden", display: "flex"
                  }}>
                    <div style={{
                      width: `${approvePercent}%`,
                      background: "#16a34a", transition: "width 0.4s ease"
                    }} />
                    <div style={{
                      width: `${rejectPercent}%`,
                      background: "#dc2626", transition: "width 0.4s ease"
                    }} />
                  </div>
                  <div style={{
                    fontSize: "11px", color: "#94a3b8", marginTop: "8px", fontWeight: 600
                  }}>
                    {req.status === "PENDING"
                      ? `⏳ Waiting for ${Math.max(0, threshold - req.approveCount)} more approvals`
                      : req.status === "APPROVED"
                      ? "✅ Approved by ward member consensus"
                      : req.status === "REJECTED"
                      ? "❌ Rejected by ward member vote"
                      : "🔵 Work completed"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
