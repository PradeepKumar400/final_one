import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/web3Config";
import { ArrowLeft, CheckCircle, Database, Vote, Activity, Clock, ShieldCheck, Download, Plus } from "lucide-react";
import { getUser } from "../utils/api";

const STATUS_MAP = ["PENDING", "APPROVED", "REJECTED", "COMPLETED"];

export default function FundManagementPage({ navigate }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const user = getUser();
  
  // Module 5: Public Transparency - Connect to blockchain (read-only by default)
  useEffect(() => {
    const initWeb3 = async () => {
      try {
        let ethersProvider;
        if (window.ethereum) {
          ethersProvider = new ethers.BrowserProvider(window.ethereum);
          await ethersProvider.send("eth_requestAccounts", []);
        } else {
          // Fallback to read-only provider
          ethersProvider = ethers.getDefaultProvider("mainnet"); // or polygon
        }
        setProvider(ethersProvider);
        
        const signer = window.ethereum ? await ethersProvider.getSigner() : ethersProvider;
        const gramanitiContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        setContract(gramanitiContract);
        
        // Fetch transactions: contract.getAllTransactions()
        const rawRequests = await gramanitiContract.getAllRequests();
        const formatted = rawRequests.map(req => ({
          id: req.id.toString(),
          transactionId: req.transactionId,
          requester: req.requester,
          amount: req.amount.toString(),
          purpose: req.purpose,
          workOrderIpfsHash: req.workOrderIpfsHash,
          approveCount: req.approveCount.toString(),
          rejectCount: req.rejectCount.toString(),
          status: STATUS_MAP[req.status],
          timestamp: req.timestamp.toString(),
          totalMembers: req.totalMembers.toString()
        }));
        setRequests(formatted);
      } catch (err) {
        console.error("Web3 initialization failed:", err);
      } finally {
        setLoading(false);
      }
    };
    initWeb3();
  }, []);

  const handleVote = async (id, approve) => {
    if (!contract) return;
    try {
      const tx = await contract.vote(BigInt(id), approve);
      await tx.wait();
      alert("Vote submitted successfully!");
      window.location.reload();
    } catch (e) {
      alert("Failed to vote: " + e.message);
    }
  };

  const handleCreateRequest = async () => {
    if (!contract) return;
    try {
      const purpose = prompt("Enter purpose:");
      const amount = prompt("Enter amount:");
      if (!purpose || !amount) return;
      const txId = "TX-" + Math.floor(Math.random() * 1000000);
      const totalMembers = 10; // Usually dynamic
      const tx = await contract.createRequest(txId, ethers.parseUnits(amount, "wei"), purpose, BigInt(totalMembers));
      await tx.wait();
      alert("Fund request submitted!");
      window.location.reload();
    } catch (e) {
      alert("Failed to create request: " + e.message);
    }
  };

  return (
    <div style={{ padding: "100px 48px", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <Database color="#10b981" /> Blockchain Ledger & Fund Allocation
          </h1>
          <p style={{ color: "#6b7280", margin: "4px 0 0" }}>Module 5: Public Transparency & Module 2: Consensus</p>
        </div>
        
        <div style={{ display: "flex", gap: "12px" }}>
          {user?.role === "PRESIDENT" && (
            <button onClick={handleCreateRequest} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
              <Plus size={18} /> New Request
            </button>
          )}
          <button onClick={() => navigate("home")} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", backgroundColor: "#fff", border: "1px solid #d1d5db", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
            <ArrowLeft size={18} /> Back
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px", color: "#6b7280" }}>
          <Activity size={40} style={{ animation: "spin 2s linear infinite", margin: "0 auto 16px" }} />
          <p>Syncing with Blockchain...</p>
        </div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px", backgroundColor: "#fff", borderRadius: "16px", border: "1px dashed #d1d5db" }}>
          <Database size={48} color="#9ca3af" style={{ marginBottom: "16px" }} />
          <h3>No records found</h3>
          <p style={{ color: "#6b7280" }}>Immutable ledger is empty.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {requests.map(req => (
            <div key={req.id} style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", borderLeft: "4px solid #10b981" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ margin: "0 0 8px", fontSize: "18px", color: "#111827" }}>{req.purpose}</h3>
                  <div style={{ display: "flex", gap: "16px", color: "#6b7280", fontSize: "14px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Activity size={16} /> TX: {req.transactionId}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={16} /> {new Date(Number(req.timestamp) * 1000).toLocaleString()}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "bold", color: "#059669" }}>₹{req.amount}</span>
                  </div>
                </div>
                <span style={{ padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, backgroundColor: req.status === "APPROVED" || req.status === "COMPLETED" ? "#d1fae5" : req.status === "PENDING" ? "#fef3c7" : "#fee2e2", color: req.status === "APPROVED" || req.status === "COMPLETED" ? "#065f46" : req.status === "PENDING" ? "#92400e" : "#991b1b" }}>
                  {req.status}
                </span>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", backgroundColor: "#f3f4f6", borderRadius: "8px", fontSize: "13px", color: "#4b5563", marginBottom: "16px" }}>
                <ShieldCheck size={16} color="#10b981" />
                <span style={{ flex: 1, fontFamily: "monospace" }}>Requested By: {req.requester}</span>
              </div>

              {req.workOrderIpfsHash && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#3b82f6", fontSize: "14px", fontWeight: "bold", marginBottom: "16px" }}>
                  <Download size={16} />
                  <a href={req.workOrderIpfsHash.replace("ipfs://", "https://ipfs.io/ipfs/")} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                    View Work Order Proof (IPFS)
                  </a>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e5e7eb", paddingTop: "16px" }}>
                <div style={{ fontSize: "14px", color: "#4b5563" }}>
                  <strong>Consensus:</strong> {req.approveCount} Approvals | {req.rejectCount} Rejections (Total: {req.totalMembers})
                </div>
                
                {user?.role === "WARD_MEMBER" && req.status === "PENDING" && (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => handleVote(req.id, true)} style={{ padding: "8px 16px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}>
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button onClick={() => handleVote(req.id, false)} style={{ padding: "8px 16px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
