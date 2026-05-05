import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../../utils/web3Config";
import { Database, ShieldCheck } from "lucide-react";

export default function GenesisLedger() {
  const [genesisFunds, setGenesisFunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);

  // Form states
  const [genAmount, setGenAmount] = useState("");
  const [genSource, setGenSource] = useState("");
  const [genRef, setGenRef] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    initWeb3();
  }, []);

  const initWeb3 = async () => {
    try {
      // Read-only load first — no wallet needed to view
      const readProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const readContract = new ethers.Contract(
        CONTRACT_ADDRESS, CONTRACT_ABI, readProvider
      );
      await fetchGenesisFunds(readContract);

      // Then connect wallet for write operations
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const writeContract = new ethers.Contract(
        CONTRACT_ADDRESS, CONTRACT_ABI, signer
      );
      setContract(writeContract);
      setWalletConnected(true);
    } catch (err) {
      console.error("Web3 init failed:", err);
    }
  };

  const fetchGenesisFunds = async (c) => {
    try {
      const raw = await c.getAllGenesisFunds();
      setGenesisFunds(raw.map(g => ({
        id:        Number(g.id),
        amount:    Number(g.amount),
        source:    g.source,
        ref:       g.ref,
        timestamp: Number(g.timestamp),
      })));
    } catch (err) {
      console.error("Failed to fetch genesis funds:", err);
    }
  };

  const handleRecordGenesis = async (e) => {
    e.preventDefault();
    if (!contract || !walletConnected) {
      alert("Please connect MetaMask first.");
      return;
    }
    setLoading(true);
    try {
      const tx = await contract.recordGenesisFund(
        ethers.parseEther(genAmount),
        genSource,
        genRef
      );
      await tx.wait();
      alert("✅ Genesis Fund recorded on Blockchain!");
      setShowForm(false);
      setGenAmount("");
      setGenSource("");
      setGenRef("");
      await fetchGenesisFunds(contract);
    } catch (err) {
      alert("Genesis recording failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 800, color: "#111827" }}>
            Genesis Ledger
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
            Record government funds received from Tamil Nadu Government onto blockchain.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "10px 20px",
            background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
            color: "#fff", border: "none", borderRadius: "10px",
            cursor: "pointer", fontWeight: 700, fontSize: "13px",
            display: "flex", alignItems: "center", gap: "8px"
          }}
        >
          <Database size={16} />
          {showForm ? "Cancel" : "Record New Fund"}
        </button>
      </div>

      {/* Genesis Form */}
      {showForm && (
        <div style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
          borderRadius: "20px", padding: "28px", color: "#fff"
        }}>
          <h3 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: 800, color: "#fff" }}>
            Record Government Fund Arrival
          </h3>
          <p style={{ margin: "0 0 24px", color: "#a5b4fc", fontSize: "13px" }}>
            This creates the first entry in the blockchain fund ledger. Cannot be modified after recording.
          </p>

          <form onSubmit={handleRecordGenesis}>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
              gap: "16px", marginBottom: "20px"
            }}>
              <div>
                <label style={{
                  display: "block", fontSize: "11px", fontWeight: 800,
                  color: "#818cf8", marginBottom: "8px", textTransform: "uppercase"
                }}>
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={genAmount}
                  onChange={e => setGenAmount(e.target.value)}
                  placeholder="e.g. 800000"
                  style={{
                    width: "100%", padding: "12px",
                    borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(255,255,255,0.1)", color: "#fff",
                    fontSize: "14px", boxSizing: "border-box", outline: "none"
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: "block", fontSize: "11px", fontWeight: 800,
                  color: "#818cf8", marginBottom: "8px", textTransform: "uppercase"
                }}>
                  Source
                </label>
                <input
                  required
                  value={genSource}
                  onChange={e => setGenSource(e.target.value)}
                  placeholder="e.g. TN Government"
                  style={{
                    width: "100%", padding: "12px",
                    borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(255,255,255,0.1)", color: "#fff",
                    fontSize: "14px", boxSizing: "border-box", outline: "none"
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: "block", fontSize: "11px", fontWeight: 800,
                  color: "#818cf8", marginBottom: "8px", textTransform: "uppercase"
                }}>
                  Reference No.
                </label>
                <input
                  required
                  value={genRef}
                  onChange={e => setGenRef(e.target.value)}
                  placeholder="e.g. TN/2026/REF/001"
                  style={{
                    width: "100%", padding: "12px",
                    borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(255,255,255,0.1)", color: "#fff",
                    fontSize: "14px", boxSizing: "border-box", outline: "none"
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px 32px", background: "#6366f1",
                color: "#fff", border: "none", borderRadius: "10px",
                fontWeight: 800, cursor: loading ? "wait" : "pointer",
                fontSize: "14px", display: "flex", alignItems: "center", gap: "8px"
              }}
            >
              <Database size={16} />
              {loading ? "Recording on Blockchain..." : "Record Genesis Fund on Blockchain"}
            </button>
          </form>
        </div>
      )}

      {/* Genesis Records List */}
      <div style={{
        background: "#fff", borderRadius: "20px", padding: "24px",
        border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
      }}>
        <h3 style={{
          margin: "0 0 20px", fontSize: "16px", fontWeight: 800,
          color: "#111827", display: "flex", alignItems: "center", gap: "8px"
        }}>
          <ShieldCheck size={18} color="#10b981" />
          Recorded Genesis Funds
          <span style={{
            fontSize: "12px", background: "#ecfdf5", color: "#059669",
            padding: "3px 10px", borderRadius: "100px", fontWeight: 700
          }}>
            {genesisFunds.length} on blockchain
          </span>
        </h3>

        {genesisFunds.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "48px",
            border: "2px dashed #e2e8f0", borderRadius: "16px", color: "#94a3b8"
          }}>
            <Database size={36} style={{ marginBottom: "12px", opacity: 0.4 }} />
            <p style={{ margin: 0, fontWeight: 700 }}>No genesis funds recorded yet.</p>
            <p style={{ margin: "6px 0 0", fontSize: "13px" }}>
              Click "Record New Fund" to add the first entry.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {genesisFunds.map(g => (
              <div key={g.id} style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", padding: "16px 20px",
                background: "#f8fafc", borderRadius: "14px",
                border: "1px solid #f1f5f9"
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "#1e293b" }}>
                    {g.source} — ₹{g.amount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                    Reference: {g.ref} ·{" "}
                    {new Date(g.timestamp * 1000).toLocaleString("en-IN")}
                  </div>
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  background: "#ecfdf5", color: "#059669",
                  padding: "6px 12px", borderRadius: "100px",
                  fontSize: "11px", fontWeight: 800,
                  border: "1px solid #d1fae5"
                }}>
                  <ShieldCheck size={13} /> ON CHAIN
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
