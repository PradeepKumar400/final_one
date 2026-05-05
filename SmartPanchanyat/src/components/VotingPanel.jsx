import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/web3Config";
import { CheckCircle2, XCircle, ShieldCheck, Clock } from "lucide-react";

const STATUS_MAP = ["PENDING", "APPROVED", "REJECTED", "COMPLETED"];

export default function VotingPanel({ currentUser }) {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [votingId, setVotingId]   = useState(null);
  const [contract, setContract]   = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentAccount, setCurrentAccount]   = useState("");
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");

  useEffect(() => {
    initWeb3();
  }, []);

  const initWeb3 = async () => {
    setLoading(true);
    try {
      if (!window.ethereum) {
        setError("MetaMask not installed.");
        return;
      }

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
      const signer   = await provider.getSigner();
      const address  = await signer.getAddress();
      setCurrentAccount(address);

      // Verify this wallet matches the registered wallet
      if (currentUser?.walletAddress &&
          address.toLowerCase() !== currentUser.walletAddress.toLowerCase()) {
        setError(
          `Wrong MetaMask account. Switch to: ${currentUser.walletAddress.slice(0,6)}...${currentUser.walletAddress.slice(-4)}`
        );
        setLoading(false);
        return;
      }

      const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(c);
      setWalletConnected(true);
      await fetchPendingRequests(c);
    } catch (err) {
      setError("Failed to connect: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async (c) => {
    try {
      const raw = await c.getAllRequests();
      const pending = raw
        .map(r => ({
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
        }))
        .filter(r => r.status === "PENDING");

      setPendingRequests(pending);
    } catch (err) {
      setError("Failed to load requests: " + err.message);
    }
  };

  const handleVote = async (requestId, approve) => {
    setError("");
    setSuccess("");

    if (!walletConnected || !contract) {
      setError("Wallet not connected. Please refresh.");
      return;
    }

    setVotingId(requestId);
    try {
      const tx = await contract.vote(BigInt(requestId), approve);
      await tx.wait();

      setSuccess(
        `✅ Vote ${approve ? "APPROVED" : "REJECTED"} recorded on blockchain!`
      );
      await fetchPendingRequests(contract);
    } catch (err) {
      if (err.message.includes("Already voted")) {
        setError("You have already voted on this request.");
      } else if (err.message.includes("Only registered ward")) {
        setError("Your wallet is not registered as a ward member. Contact admin.");
      } else {
        setError("Voting failed: " + err.message);
      }
    } finally {
      setVotingId(null);
    }
  };

  // Wallet not connected warning
  if (!currentUser?.walletAddress) {
    return (
      <div style={{
        background: "#fef3c7", border: "2px solid #f59e0b",
        borderRadius: "16px", padding: "24px"
      }}>
        <h3 style={{ margin: "0 0 8px", color: "#92400e" }}>⚠️ Wallet Not Connected</h3>
        <p style={{ margin: 0, color: "#78350f" }}>
          Connect your MetaMask wallet using the "Connect Wallet" button in the
          top-right navbar before you can vote.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 800, color: "#111827" }}>
            Pending Votes
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
            Review and vote on fund requests. Your vote is signed by your wallet and recorded permanently.
          </p>
        </div>

        {walletConnected && (
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "#f0fdf4", border: "1px solid #86efac",
            padding: "8px 14px", borderRadius: "10px", fontSize: "12px"
          }}>
            <ShieldCheck size={14} color="#16a34a" />
            <span style={{ color: "#166534", fontWeight: 700 }}>
              Voting as: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
            </span>
          </div>
        )}
      </div>

      {/* Error / Success */}
      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fca5a5",
          borderRadius: "12px", padding: "14px",
          color: "#b91c1c", fontWeight: 600, fontSize: "13px"
        }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div style={{
          background: "#f0fdf4", border: "1px solid #86efac",
          borderRadius: "12px", padding: "14px",
          color: "#166534", fontWeight: 600, fontSize: "13px"
        }}>
          {success}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
          Connecting to blockchain...
        </div>
      )}

      {/* Empty state */}
      {!loading && pendingRequests.length === 0 && (
        <div style={{
          textAlign: "center", padding: "60px",
          border: "2px dashed #e2e8f0", borderRadius: "20px",
          background: "#f8fafc", color: "#94a3b8"
        }}>
          <Clock size={40} style={{ marginBottom: "12px", opacity: 0.4 }} />
          <p style={{ margin: 0, fontWeight: 700 }}>No pending fund requests.</p>
          <p style={{ margin: "6px 0 0", fontSize: "13px" }}>
            When the president submits a request, it will appear here for your vote.
          </p>
        </div>
      )}

      {/* Pending Requests */}
      {pendingRequests.map(req => {
        const threshold = Math.floor(req.totalMembers / 2) + 1;
        const approvePercent = req.totalMembers > 0
          ? (req.approveCount / req.totalMembers) * 100 : 0;
        const rejectPercent = req.totalMembers > 0
          ? (req.rejectCount / req.totalMembers) * 100 : 0;
        const isVoting = votingId === req.id;

        return (
          <div key={req.id} style={{
            background: "#fff", borderRadius: "18px", padding: "24px",
            border: "1px solid #f1f5f9",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            borderLeft: "4px solid #f59e0b"
          }}>
            {/* Request info */}
            <div style={{ marginBottom: "16px" }}>
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
              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px", fontFamily: "monospace" }}>
                By: {req.requester.slice(0,10)}...{req.requester.slice(-6)}
              </div>
            </div>

            {/* Vote progress */}
            <div style={{
              background: "#f8fafc", borderRadius: "12px",
              padding: "14px", marginBottom: "16px"
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                fontSize: "12px", fontWeight: 700, marginBottom: "8px"
              }}>
                <span style={{ color: "#16a34a" }}>✅ {req.approveCount} Approved</span>
                <span style={{ color: "#64748b" }}>
                  {req.approveCount + req.rejectCount}/{req.totalMembers} voted · needs {threshold}
                </span>
                <span style={{ color: "#dc2626" }}>❌ {req.rejectCount} Rejected</span>
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
            </div>

            {/* Vote buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => handleVote(req.id, true)}
                disabled={isVoting || loading}
                style={{
                  flex: 1, padding: "12px",
                  background: isVoting ? "#ccc" : "#dcfce7",
                  color: isVoting ? "#fff" : "#166534",
                  border: "2px solid #86efac",
                  borderRadius: "10px", cursor: isVoting ? "wait" : "pointer",
                  fontWeight: 800, fontSize: "14px",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: "6px"
                }}
              >
                <CheckCircle2 size={16} />
                {isVoting ? "Processing..." : "Approve"}
              </button>
              <button
                onClick={() => handleVote(req.id, false)}
                disabled={isVoting || loading}
                style={{
                  flex: 1, padding: "12px",
                  background: isVoting ? "#ccc" : "#fee2e2",
                  color: isVoting ? "#fff" : "#991b1b",
                  border: "2px solid #fca5a5",
                  borderRadius: "10px", cursor: isVoting ? "wait" : "pointer",
                  fontWeight: 800, fontSize: "14px",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: "6px"
                }}
              >
                <XCircle size={16} />
                {isVoting ? "Processing..." : "Reject"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
