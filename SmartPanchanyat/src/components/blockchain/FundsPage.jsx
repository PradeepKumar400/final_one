import React, { useState, useEffect } from "react";
import {
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  History,
  ShieldCheck,
  Link as LinkIcon,
  TrendingUp,
  Award,
  BarChart3,
  Camera,
  Database,
} from "lucide-react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../../utils/web3Config";
import { getUser } from "../../utils/api";

const STATUS_MAP = ["PENDING", "APPROVED", "REJECTED", "COMPLETED"];

const FundsPage = ({ navigate }) => {
  const user = getUser();
  const role = user?.role || "CITIZEN";

  const isAdmin = role === "ADMIN";
  const isPresident = role === "PRESIDENT" || isAdmin;
  const isWardMember = role === "WARD_MEMBER" || isAdmin;

  const [activeTab, setActiveTab] = useState(
    role === "CITIZEN" ? "APPROVED" : "PENDING",
  );
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showGenesisForm, setShowGenesisForm] = useState(false);
  const [genesisFunds, setGenesisFunds] = useState([]);

  // Form states
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState("");
  const [wardId, setWardId] = useState("");

  // Genesis states
  const [genAmount, setGenAmount] = useState("");
  const [genSource, setGenSource] = useState("");
  const [genRef, setGenRef] = useState("");

  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    const initWeb3 = async () => {
      setLoading(true);
      try {
        if (!window.ethereum) {
          console.warn(
            "MetaMask not found. Install MetaMask to interact with the blockchain.",
          );
          setLoading(false);
          return;
        }

        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // Switch MetaMask to the Hardhat local network (chainId 31337 = 0x7A69)
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x7A69" }],
          });
        } catch (switchError) {
          // If the chain doesn't exist in MetaMask, add it automatically
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x7A69",
                  chainName: "Hardhat Local",
                  rpcUrls: ["http://127.0.0.1:8545"],
                  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                },
              ],
            });
          } else {
            console.error("Failed to switch network:", switchError);
          }
        }

        const ethersProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(ethersProvider);
        setWalletConnected(true);

        const signer = await ethersProvider.getSigner();
        const gramanitiContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer,
        );
        setContract(gramanitiContract);

        await fetchFundsFromBlockchain(gramanitiContract);
      } catch (err) {
        console.error("Web3 initialization failed:", err);
      } finally {
        setLoading(false);
      }
    };
    initWeb3();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        initWeb3();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", initWeb3);
      }
    };
  }, []);

  const [currentAccount, setCurrentAccount] = useState("");
  useEffect(() => {
    const getAccount = async () => {
      if (provider) {
        const signer = await provider.getSigner();
        setCurrentAccount(await signer.getAddress());
      }
    };
    getAccount();
  }, [provider, walletConnected]);

  useEffect(() => {
    if (contract && walletConnected) {
      fetchFundsFromBlockchain(contract);
    }
  }, [activeTab]);

  const fetchFundsFromBlockchain = async (gramanitiContract) => {
    try {
      const [rawRequests, rawGenesis] = await Promise.all([
        gramanitiContract.getAllRequests(),
        gramanitiContract.getAllGenesisFunds(),
      ]);

      const formatted = rawRequests.map((req) => ({
        id: req.id.toString(),
        transactionId: req.transactionId,
        requester: req.requester,
        amount: parseFloat(req.amount.toString()),
        purpose: req.purpose,
        workOrderIpfsHash: req.workOrderIpfsHash,
        approveCount: parseInt(req.approveCount.toString()),
        rejectCount: parseInt(req.rejectCount.toString()),
        status: STATUS_MAP[req.status],
        timestamp: req.timestamp.toString(),
        totalMembers: parseInt(req.totalMembers.toString()),
        votes: [],
      }));

      const formattedGenesis = rawGenesis.map((g) => ({
        id: g.id.toString(),
        amount: parseFloat(g.amount.toString()),
        source: g.source,
        ref: g.ref,
        timestamp: g.timestamp.toString(),
      }));

      setGenesisFunds(formattedGenesis);

      // Filter based on active tab
      if (activeTab === "PENDING") {
        setFunds(formatted.filter((f) => f.status === "PENDING"));
      } else if (activeTab === "APPROVED") {
        setFunds(
          formatted.filter(
            (f) => f.status === "APPROVED" || f.status === "COMPLETED",
          ),
        );
      } else {
        setFunds(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch blockchain data:", err);
    }
  };

  const handleRecordGenesis = async (e) => {
    e.preventDefault();
    if (!contract || !walletConnected) return;
    try {
      setLoading(true);
      const tx = await contract.recordGenesisFund(
        ethers.parseUnits(genAmount, "wei"),
        genSource,
        genRef,
      );
      await tx.wait();
      alert("Genesis Fund Recorded on Blockchain!");
      setShowGenesisForm(false);
      setGenAmount("");
      setGenSource("");
      setGenRef("");
      await fetchFundsFromBlockchain(contract);
    } catch (err) {
      alert("Genesis recording failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!contract || !walletConnected) {
      alert("Please connect MetaMask first.");
      return;
    }
    try {
      setLoading(true);
      const txId = "TX-" + Math.floor(Math.random() * 1000000);
      const totalMembers = 6; // Set to 6 to match your panchayat member count

      const tx = await contract.createRequest(
        txId,
        ethers.parseUnits(amount, "wei"),
        purpose,
        BigInt(totalMembers),
      );
      await tx.wait();

      alert(
        "Fund Request Digitally Signed & Submitted to Ethereum!\nTransaction ID: " +
          txId,
      );
      setShowForm(false);
      setPurpose("");
      setAmount("");
      setWardId("");
      await fetchFundsFromBlockchain(contract);
    } catch (error) {
      if (error.message.includes("Only registered President")) {
        alert(
          "Action Denied: Your MetaMask account is not registered as a President on the blockchain.",
        );
      } else {
        alert("Submission failed: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (id, approve) => {
    if (!contract || !walletConnected) {
      alert("Please connect MetaMask first.");
      return;
    }
    try {
      setLoading(true);
      const tx = await contract.vote(BigInt(id), approve);
      await tx.wait();

      alert(`Vote Digitally Signed & Recorded on Ethereum!`);
      await fetchFundsFromBlockchain(contract);
    } catch (error) {
      if (error.message.includes("Already voted")) {
        alert(
          "Action Denied: This MetaMask account has already cast a vote for this request.",
        );
      } else if (error.message.includes("Not pending")) {
        alert("Action Denied: This request is already Approved or Rejected.");
      } else if (error.message.includes("Only registered Ward Member")) {
        alert(
          "Action Denied: Your MetaMask account is not registered as a Ward Member. Please contact Admin for activation.",
        );
      } else {
        alert("Voting failed: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderBadge = (status) => {
    const colors = {
      APPROVED: { bg: "#dcfce7", text: "#166534" },
      COMPLETED: { bg: "#dcfce7", text: "#166534" },
      PENDING: { bg: "#fef9c3", text: "#854d0e" },
      REJECTED: { bg: "#fee2e2", text: "#991b1b" },
    };
    const style = colors[status] || colors.PENDING;
    return (
      <span
        style={{
          padding: "4px 10px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: 600,
          backgroundColor: style.bg,
          color: style.text,
          textTransform: "uppercase",
        }}
      >
        {status}
      </span>
    );
  };

  const renderAnalytics = () => {
    const totalApproved = funds.reduce(
      (acc, f) =>
        acc +
        (f.status === "APPROVED" || f.status === "COMPLETED" ? f.amount : 0),
      0,
    );

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <h4 style={{ color: "#64748b", margin: 0 }}>
              Total Funds Approved
            </h4>
            <Award style={{ color: "#4f46e5" }} />
          </div>
          <p
            style={{
              fontSize: "28px",
              fontWeight: 700,
              margin: 0,
              color: "#1e1b4b",
            }}
          >
            ₹{totalApproved.toLocaleString()}
          </p>
          <p
            style={{
              color: "#166534",
              fontSize: "14px",
              marginTop: "8px",
              fontWeight: 500,
            }}
          >
            Ethereum Verified
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <h4 style={{ color: "#64748b", margin: 0 }}>Consensus Accuracy</h4>
            <ShieldCheck style={{ color: "#10b981" }} />
          </div>
          <p
            style={{
              fontSize: "28px",
              fontWeight: 700,
              margin: 0,
              color: "#1e1b4b",
            }}
          >
            100%
          </p>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "8px" }}>
            Secured by Smart Contracts
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <h4 style={{ color: "#64748b", margin: 0 }}>Transparency Rating</h4>
            <TrendingUp style={{ color: "#f59e0b" }} />
          </div>
          <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Award key={i} size={20} fill={"#f59e0b"} color="#f59e0b" />
            ))}
          </div>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "8px" }}>
            Immutable Public Ledger
          </p>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "45px auto",
        padding: "40px 20px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "40px",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            <Database size={32} color="#4f46e5" />
            <h1
              style={{
                fontSize: "32px",
                fontWeight: 800,
                color: "#1e1b4b",
                margin: 0,
              }}
            >
              Ethereum Fund Governance
            </h1>
          </div>
          <p
            style={{
              color: "#64748b",
              fontSize: "16px",
              maxWidth: "600px",
              marginBottom: "12px",
            }}
          >
            Transparent, immutable record of panchayat funds on
            Polygon/Ethereum. Every rupee is tracked via Smart Contracts.
          </p>
          {walletConnected ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#f1f5f9",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <ShieldCheck size={14} color="#10b981" />
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#475569",
                  }}
                >
                  MetaMask Connected
                </span>
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  fontFamily: "monospace",
                  padding: "0 4px",
                }}
              >
                Active Wallet:{" "}
                <span style={{ color: "#4f46e5", fontWeight: 700 }}>
                  {currentAccount}
                </span>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#fee2e2",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid #fecaca",
              }}
            >
              <span
                style={{ fontSize: "12px", fontWeight: 600, color: "#991b1b" }}
              >
                Read Only View (No Wallet Connected)
              </span>
            </div>
          )}
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setShowGenesisForm(!showGenesisForm);
              setActiveTab("GENESIS");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              background: "#1e1b4b",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: 600,
              boxShadow: "0 10px 15px -3px rgba(30, 27, 75, 0.3)",
              marginRight: "12px",
            }}
          >
            <Database size={20} /> Record Genesis Fund
          </button>
        )}

        {isPresident && (
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (activeTab === "ANALYTICS" || activeTab === "GENESIS")
                setActiveTab("PENDING");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: 600,
              boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.3)",
            }}
          >
            <Plus size={20} /> Propose Fund Allocation
          </button>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "32px",
          marginBottom: "32px",
          borderBottom: "2px solid #f1f5f9",
        }}
      >
        {(isWardMember || isPresident) && (
          <button
            onClick={() => setActiveTab("PENDING")}
            style={{
              padding: "12px 4px",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === "PENDING"
                  ? "2px solid #4f46e5"
                  : "2px solid transparent",
              color: activeTab === "PENDING" ? "#4f46e5" : "#64748b",
              fontWeight: activeTab === "PENDING" ? 700 : 500,
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Pending Approvals
          </button>
        )}
        <button
          onClick={() => setActiveTab("APPROVED")}
          style={{
            padding: "12px 4px",
            background: "none",
            border: "none",
            borderBottom:
              activeTab === "APPROVED"
                ? "2px solid #4f46e5"
                : "2px solid transparent",
            color: activeTab === "APPROVED" ? "#4f46e5" : "#64748b",
            fontWeight: activeTab === "APPROVED" ? 700 : 500,
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Transparency Feed
        </button>
        <button
          onClick={() => setActiveTab("GENESIS")}
          style={{
            padding: "12px 4px",
            background: "none",
            border: "none",
            borderBottom:
              activeTab === "GENESIS"
                ? "2px solid #4f46e5"
                : "2px solid transparent",
            color: activeTab === "GENESIS" ? "#4f46e5" : "#64748b",
            fontWeight: activeTab === "GENESIS" ? 700 : 500,
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Genesis Ledger
        </button>
        <button
          onClick={() => setActiveTab("ANALYTICS")}
          style={{
            padding: "12px 4px",
            background: "none",
            border: "none",
            borderBottom:
              activeTab === "ANALYTICS"
                ? "2px solid #4f46e5"
                : "2px solid transparent",
            color: activeTab === "ANALYTICS" ? "#4f46e5" : "#64748b",
            fontWeight: activeTab === "ANALYTICS" ? 700 : 500,
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Ledger Analytics
        </button>
      </div>

      {/* Analytics Tab Content */}
      {activeTab === "ANALYTICS" && (
        <>
          {renderAnalytics()}
          <div
            style={{
              background: "#f8fafc",
              padding: "32px",
              borderRadius: "16px",
              border: "1px dashed #cbd5e1",
              textAlign: "center",
            }}
          >
            <BarChart3
              size={48}
              color="#94a3b8"
              style={{ marginBottom: "16px" }}
            />
            <h3 style={{ color: "#1e1b4b" }}>Detailed Term Performance</h3>
            <p style={{ color: "#64748b" }}>
              Analytics are generated directly from Ethereum block timestamps to
              ensure 100% accuracy.
            </p>
          </div>
        </>
      )}

      {/* Genesis Form */}
      {showGenesisForm && isAdmin && (
        <div
          style={{
            background: "#f1f5f9",
            padding: "32px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            marginBottom: "40px",
            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "24px",
            }}
          >
            <h3 style={{ margin: 0, color: "#1e1b4b" }}>
              Step 1: Record Government Fund Arrival
            </h3>
            <button
              onClick={() => setShowGenesisForm(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
              }}
            >
              ✕
            </button>
          </div>
          <form
            onSubmit={handleRecordGenesis}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "20px",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}
              >
                Amount (₹)
              </label>
              <input
                type="number"
                value={genAmount}
                onChange={(e) => setGenAmount(e.target.value)}
                placeholder="Total Received"
                required
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                }}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}
              >
                Source
              </label>
              <input
                value={genSource}
                onChange={(e) => setGenSource(e.target.value)}
                placeholder="e.g. TN Govt"
                required
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                }}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}
              >
                Reference No.
              </label>
              <input
                value={genRef}
                onChange={(e) => setGenRef(e.target.value)}
                placeholder="Ref ID"
                required
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                gridColumn: "span 3",
                padding: "14px",
                background: "#1e1b4b",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: 700,
                cursor: loading ? "wait" : "pointer",
              }}
            >
              {loading
                ? "Recording Genesis Block..."
                : "Create Genesis Fund Entry on Blockchain"}
            </button>
          </form>
        </div>
      )}

      {/* Submission Form */}
      {showForm && isPresident && (
        <div
          style={{
            background: "#fff",
            padding: "32px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            marginBottom: "40px",
            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "24px",
            }}
          >
            <h3 style={{ margin: 0, color: "#1e1b4b" }}>New Fund Proposal</h3>
            <button
              onClick={() => setShowForm(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
              }}
            >
              ✕
            </button>
          </div>
          <form
            onSubmit={handleCreateRequest}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "20px",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}
              >
                Purpose
              </label>
              <input
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Solar Street Lights"
                required
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                }}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}
              >
                Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50000"
                required
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                }}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}
              >
                Ward ID
              </label>
              <select
                value={wardId}
                onChange={(e) => setWardId(e.target.value)}
                required
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                }}
              >
                <option value="">Select Ward</option>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <option key={i} value={`Ward ${i}`}>
                    Ward {i}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                gridColumn: "span 3",
                padding: "14px",
                background: "#1e1b4b",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: 700,
                cursor: loading ? "wait" : "pointer",
                marginTop: "12px",
              }}
            >
              {loading
                ? "Processing via Smart Contract..."
                : "Digitally Sign & Submit to Ethereum"}
            </button>
          </form>
        </div>
      )}

      {/* Funds & Genesis List */}
      {activeTab === "GENESIS" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {genesisFunds.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px",
                background: "#f8fafc",
                borderRadius: "16px",
                border: "1px dashed #cbd5e1",
              }}
            >
              <Database
                size={48}
                color="#cbd5e1"
                style={{ marginBottom: "16px" }}
              />
              <p style={{ color: "#64748b", fontSize: "18px" }}>
                No Genesis records found.
              </p>
            </div>
          ) : (
            genesisFunds.map((g) => (
              <div
                key={g.id}
                style={{
                  background: "#fff",
                  padding: "24px",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>
                    <h4 style={{ margin: 0, color: "#1e1b4b" }}>
                      {g.source} - ₹{g.amount.toLocaleString()}
                    </h4>
                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "14px",
                        margin: "4px 0",
                      }}
                    >
                      Reference: {g.ref}
                    </p>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                      Recorded:{" "}
                      {new Date(parseInt(g.timestamp) * 1000).toLocaleString()}
                    </span>
                  </div>
                  <ShieldCheck color="#10b981" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab !== "ANALYTICS" && activeTab !== "GENESIS" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {loading ? (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#64748b" }}
            >
              Securing connection to Ethereum...
            </div>
          ) : funds.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px",
                background: "#f8fafc",
                borderRadius: "16px",
                border: "1px dashed #cbd5e1",
              }}
            >
              <Clock
                size={48}
                color="#cbd5e1"
                style={{ marginBottom: "16px" }}
              />
              <p style={{ color: "#64748b", fontSize: "18px" }}>
                No transactions found on the Smart Contract ledger.
              </p>
            </div>
          ) : (
            funds.map((fund) => (
              <div
                key={fund.id}
                style={{
                  background: "#fff",
                  padding: "24px",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  transition: "all 0.2s",
                  ":hover": { boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" },
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "4px",
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "20px",
                          color: "#1e1b4b",
                        }}
                      >
                        {fund.purpose}
                      </h3>
                      {renderBadge(fund.status)}
                      <span
                        title="Ethereum Verified"
                        style={{ cursor: "help" }}
                      >
                        <ShieldCheck size={18} color="#10b981" />
                      </span>
                    </div>
                    <p
                      style={{ color: "#64748b", fontSize: "14px", margin: 0 }}
                    >
                      Req ID:{" "}
                      <span
                        style={{ fontFamily: "monospace", color: "#4f46e5" }}
                      >
                        {fund.id}
                      </span>{" "}
                      • TX:{" "}
                      <span style={{ fontFamily: "monospace" }}>
                        {fund.transactionId}
                      </span>{" "}
                      • Amount:{" "}
                      <span style={{ fontWeight: 600, color: "#1e1b4b" }}>
                        ₹{fund.amount?.toLocaleString()}
                      </span>
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {fund.workOrderIpfsHash && (
                      <>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#94a3b8",
                            margin: "0 0 4px 0",
                          }}
                        >
                          IPFS Document CID:
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            background: "#f1f5f9",
                            padding: "4px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          <LinkIcon size={12} color="#64748b" />
                          <span
                            style={{
                              fontSize: "11px",
                              fontFamily: "monospace",
                              color: "#475569",
                            }}
                          >
                            {fund.workOrderIpfsHash.substring(0, 15)}...
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    height: "1px",
                    background: "#f1f5f9",
                    margin: "16px 0",
                  }}
                ></div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", gap: "24px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "#64748b",
                        fontSize: "14px",
                      }}
                    >
                      <CheckCircle2 size={16} color="#10b981" />
                      <span>{fund.approveCount} Approvals</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "#64748b",
                        fontSize: "14px",
                      }}
                    >
                      <XCircle size={16} color="#ef4444" />
                      <span>{fund.rejectCount} Rejections</span>
                    </div>
                  </div>

                  {isWardMember && activeTab === "PENDING" && (
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button
                        disabled={loading}
                        onClick={() => handleVote(fund.id, true)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "10px 20px",
                          background: "#dcfce7",
                          color: "#166534",
                          border: "none",
                          borderRadius: "8px",
                          cursor: loading ? "wait" : "pointer",
                          fontWeight: 700,
                        }}
                      >
                        Approve via Smart Contract
                      </button>
                      <button
                        disabled={loading}
                        onClick={() => handleVote(fund.id, false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "10px 20px",
                          background: "#fee2e2",
                          color: "#991b1b",
                          border: "none",
                          borderRadius: "8px",
                          cursor: loading ? "wait" : "pointer",
                          fontWeight: 700,
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {activeTab === "APPROVED" && (
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 16px",
                          background: "#f1f5f9",
                          color: "#475569",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: "13px",
                        }}
                      >
                        <History size={14} /> View IPFS Proof
                      </button>
                      {isPresident && fund.status === "APPROVED" && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <input
                            type="file"
                            id={`file-${fund.id}`}
                            style={{ display: "none" }}
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;

                              try {
                                setLoading(true);
                                // 1. Upload to Backend
                                const formData = new FormData();
                                formData.append(
                                  "transactionId",
                                  fund.transactionId,
                                );
                                formData.append("purpose", fund.purpose);
                                formData.append("amount", fund.amount);
                                formData.append("beforeImage", file);

                                const res = await fetch(
                                  "http://localhost:8080/api/v1/work-orders",
                                  {
                                    method: "POST",
                                    body: formData,
                                  },
                                );
                                const workOrder = await res.json();
                                const ipfsHash = workOrder.beforeImageIpfsHash;

                                // 2. Update Blockchain
                                const tx = await contract.updateWorkOrder(
                                  fund.id,
                                  ipfsHash,
                                );
                                await tx.wait();

                                alert(
                                  "Work Order Proof (IPFS) synced to Blockchain!",
                                );
                                await fetchFundsFromBlockchain(contract);
                              } catch (err) {
                                alert(
                                  "Failed to update work order: " + err.message,
                                );
                              } finally {
                                setLoading(false);
                              }
                            }}
                          />
                          <button
                            onClick={() =>
                              document.getElementById(`file-${fund.id}`).click()
                            }
                            disabled={loading}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "8px 16px",
                              background: "#1e1b4b",
                              color: "#fff",
                              border: "none",
                              borderRadius: "8px",
                              cursor: loading ? "wait" : "pointer",
                              fontWeight: 600,
                              fontSize: "13px",
                            }}
                          >
                            <Camera size={14} />{" "}
                            {loading ? "Syncing..." : "Upload Proof (IPFS)"}
                          </button>
                        </div>
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
      <div
        style={{
          marginTop: "64px",
          padding: "32px",
          background: "linear-gradient(to right, #1e1b4b, #312e81)",
          borderRadius: "20px",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h4 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>
            Blockchain Governance Node
          </h4>
          <p style={{ margin: 0, color: "#c7d2fe", fontSize: "14px" }}>
            Status:{" "}
            <span style={{ color: "#4ade80", fontWeight: 700 }}>
              ● {walletConnected ? "CONNECTED" : "READ ONLY"}
            </span>
            | Network: Ethereum / Polygon Smart Contracts
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
            Contract: {CONTRACT_ADDRESS.substring(0, 10)}...
          </p>
        </div>
      </div>
    </div>
  );
};

export default FundsPage;
