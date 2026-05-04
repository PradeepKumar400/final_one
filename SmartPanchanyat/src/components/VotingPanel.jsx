import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/web3Config";

export default function VotingPanel({ currentUser, authToken }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [votingId, setVotingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [walletReady, setWalletReady] = useState(false);

  // On load — verify MetaMask is connected with registered wallet
  useEffect(() => {
    checkWallet();
    loadRequests();
  }, []);

  const checkWallet = async () => {
    if (!window.ethereum) return;
    if (!currentUser?.walletAddress) return;

    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });

    if (accounts.length > 0 &&
        accounts[0].toLowerCase() === currentUser.walletAddress.toLowerCase()) {
      setWalletReady(true);
    }
  };

  const loadRequests = async () => {
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS, CONTRACT_ABI, provider
      );
      const all = await contract.getAllRequests();

      // Only show PENDING requests
      // Note: ethers returns BigInt for uint256, so compare with 0n
      const pending = all.filter(r => r.status === 0n); 
      setRequests(pending);
    } catch (err) {
      setError("Failed to load requests: " + err.message);
    }
  };

  const ensureCorrectWallet = async () => {
    // Step 1: Check if MetaMask has the right account active
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });

    const registeredAddress = currentUser.walletAddress.toLowerCase();

    if (accounts.length > 0 &&
        accounts[0].toLowerCase() === registeredAddress) {
      // Already on correct account ✅
      return true;
    }

    // Step 2: Wrong account — force account switcher open
    setError(
      `Wrong MetaMask account! Please switch to: ${currentUser.walletAddress.slice(0,6)}...${currentUser.walletAddress.slice(-4)}`
    );

    await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    });

    // Step 3: Check again after switcher
    const newAccounts = await window.ethereum.request({
      method: "eth_accounts",
    });

    if (newAccounts[0].toLowerCase() !== registeredAddress) {
      throw new Error(
        "Still wrong account selected. Please select " +
        currentUser.walletAddress
      );
    }

    return true;
  };

  const handleVote = async (requestId, approve) => {
    setError("");
    setSuccess("");
    setVotingId(requestId);

    try {
      // Step 1: Check wallet is not connected at all
      if (!currentUser?.walletAddress) {
        throw new Error(
          "You have not connected a wallet yet. " +
          "Please connect your MetaMask wallet first."
        );
      }

      if (!window.ethereum) {
        throw new Error("MetaMask not installed.");
      }

      // Step 2: Make sure correct MetaMask account is active
      await ensureCorrectWallet();

      // Step 3: Connect with ward member's own signer
      // This is KEY — the ward member signs with THEIR private key
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Step 4: Double-check signer address matches registered wallet
      const signerAddress = await signer.getAddress();
      if (signerAddress.toLowerCase() !==
          currentUser.walletAddress.toLowerCase()) {
        throw new Error(
          "MetaMask account does not match your registered wallet. " +
          "Expected: " + currentUser.walletAddress
        );
      }

      // Step 5: Cast vote — signed by ward member's private key
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS, CONTRACT_ABI, signer
      );

      const tx = await contract.vote(requestId, approve);
      await tx.wait(); // wait for block confirmation

      setSuccess(
        `✅ Vote ${approve ? "APPROVED" : "REJECTED"} successfully! ` +
        `Signed by ${signerAddress.slice(0,6)}...${signerAddress.slice(-4)}`
      );

      // Reload requests to see updated vote counts
      await loadRequests();

    } catch (err) {
      if (err.code === 4001) {
        setError("Vote cancelled — you rejected the MetaMask request.");
      } else if (err.message.includes("Already voted")) {
        setError("You have already voted on this request.");
      } else if (err.message.includes("Only ward member")) {
        setError(
          "Your wallet is not registered as a ward member on the blockchain. " +
          "Please reconnect your wallet."
        );
      } else {
        setError(err.message);
      }
    }

    setVotingId(null);
  };

  // ── Wallet not connected warning ──
  if (!currentUser?.walletAddress) {
    return (
      <div style={{
        background: "#fef3c7", border: "2px solid #f59e0b",
        borderRadius: 12, padding: 24, marginBottom: 28,
        fontFamily: "inherit"
      }}>
        <h3 style={{ margin: "0 0 10px", fontSize: "18px", fontWeight: 800 }}>⚠️ Wallet Not Connected</h3>
        <p style={{ margin: 0, fontSize: "14px", color: "#92400e", lineHeight: 1.5 }}>
          You must connect your MetaMask wallet before you can vote.
          Click the <strong>"Connect Wallet"</strong> button in the top right header.
        </p>
      </div>
    );
  }

  // ── Wrong wallet warning ──
  if (!walletReady) {
    return (
      <div style={{
        background: "#fef3c7", border: "2px solid #f59e0b",
        borderRadius: 12, padding: 24, marginBottom: 28,
        fontFamily: "inherit"
      }}>
        <h3 style={{ margin: "0 0 10px", fontSize: "18px", fontWeight: 800 }}>⚠️ Switch MetaMask Account</h3>
        <p style={{ margin: "0 0 14px", fontSize: "14px", color: "#92400e" }}>
          Your registered wallet for this account is:
        </p>
        <code style={{ 
          display: "block", background: "white", padding: "12px", 
          borderRadius: "8px", fontSize: "13px", border: "1px solid #fde68a" 
        }}>
          {currentUser.walletAddress}
        </code>
        <p style={{ margin: "14px 0 0", fontSize: "14px", color: "#92400e" }}>
          Please switch to this account in MetaMask and <strong>refresh the page</strong>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "inherit" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#111827", margin: 0 }}>
          🗳️ Fund Requests for Approval
        </h2>
        <div style={{
          background: "#f0fdf4", border: "1.5px solid #86efac",
          borderRadius: "100px", padding: "6px 16px",
          fontSize: "12px", display: "flex", alignItems: "center", gap: "8px"
        }}>
          <span style={{ height: "8px", width: "8px", borderRadius: "50%", background: "#16a34a" }}></span>
          <span style={{ color: "#166534", fontWeight: 700 }}>
            Voting as: {currentUser.walletAddress.slice(0,6)}...{currentUser.walletAddress.slice(-4)}
          </span>
        </div>
      </div>

      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fca5a5",
          borderRadius: 10, padding: 16, color: "#dc2626",
          marginBottom: 20, fontSize: "14px", fontWeight: 500
        }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div style={{
          background: "#f0fdf4", border: "1px solid #86efac",
          borderRadius: 10, padding: 16, color: "#16a34a",
          marginBottom: 20, fontSize: "14px", fontWeight: 500
        }}>
          {success}
        </div>
      )}

      {requests.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 40px",
          color: "#94a3b8", border: "2px dashed #e2e8f0", borderRadius: 16,
          background: "#f8fafc"
        }}>
          <p style={{ margin: 0, fontWeight: 600 }}>No pending fund requests at the moment.</p>
          <p style={{ margin: "4px 0 0", fontSize: "13px" }}>Check back later when the President creates a new request.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {requests.map((req) => (
            <div key={req.id.toString()} style={{
              border: "1px solid #e2e8f0", borderRadius: 16,
              padding: 24, background: "white", 
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
              transition: "transform 0.2s"
            }}>
              {/* Request Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <span style={{ 
                    fontSize: "11px", fontWeight: 800, color: "#64748b", 
                    textTransform: "uppercase", letterSpacing: "0.5px" 
                  }}>
                    Request ID: #{req.id.toString()}
                  </span>
                  <h3 style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: 800, color: "#1e293b" }}>
                    {req.purpose}
                  </h3>
                </div>
                <div style={{ 
                  background: "#f1f5f9", padding: "8px 16px", borderRadius: "12px",
                  textAlign: "right"
                }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Amount</div>
                  <div style={{ fontSize: "16px", fontWeight: 900, color: "#0f172a" }}>
                    ₹{Number(req.amount).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Vote Progress */}
              <div style={{ 
                background: "#f8fafc", borderRadius: "12px", padding: "16px",
                marginBottom: 24, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px"
              }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#166534", marginBottom: "4px" }}>APPROVE</div>
                  <div style={{ fontSize: "18px", fontWeight: 900, color: "#16a34a" }}>{req.approveCount.toString()}</div>
                </div>
                <div style={{ textAlign: "center", borderLeft: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#991b1b", marginBottom: "4px" }}>REJECT</div>
                  <div style={{ fontSize: "18px", fontWeight: 900, color: "#dc2626" }}>{req.rejectCount.toString()}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>TOTAL QUORUM</div>
                  <div style={{ fontSize: "18px", fontWeight: 900, color: "#1e293b" }}>{req.totalMembers.toString()}</div>
                </div>
              </div>

              {/* Vote Actions */}
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => handleVote(req.id, true)}
                  disabled={votingId === req.id}
                  style={{
                    background: votingId === req.id ? "#e2e8f0" : "#16a34a",
                    color: "white", border: "none", borderRadius: "12px",
                    padding: "14px 24px", fontSize: "14px", fontWeight: 800,
                    cursor: votingId === req.id ? "not-allowed" : "pointer",
                    flex: 1, transition: "all 0.2s",
                    boxShadow: votingId === req.id ? "none" : "0 4px 12px rgba(22, 163, 74, 0.2)"
                  }}
                >
                  {votingId === req.id ? "VOTING..." : "✅ APPROVE"}
                </button>

                <button
                  onClick={() => handleVote(req.id, false)}
                  disabled={votingId === req.id}
                  style={{
                    background: votingId === req.id ? "#e2e8f0" : "#dc2626",
                    color: "white", border: "none", borderRadius: "12px",
                    padding: "14px 24px", fontSize: "14px", fontWeight: 800,
                    cursor: votingId === req.id ? "not-allowed" : "pointer",
                    flex: 1, transition: "all 0.2s",
                    boxShadow: votingId === req.id ? "none" : "0 4px 12px rgba(220, 38, 38, 0.2)"
                  }}
                >
                  {votingId === req.id ? "VOTING..." : "❌ REJECT"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
