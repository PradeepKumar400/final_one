import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ShieldCheck, Copy, CheckCircle2, AlertCircle, ArrowRight, RefreshCcw } from "lucide-react";

export default function WalletSetupPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Info, 2: Generated, 3: Success
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const res = await fetch(`http://localhost:8081/api/v1/blockchain/identity/verify-token/${token}`);
      const data = await res.json();
      if (data.status === "SUCCESS") {
        setUser(data.data);
      } else {
        setError(data.message || "Invalid or expired setup link.");
      }
    } catch (err) {
      setError("Unable to connect to server.");
    }
  };

  const handleGenerate = () => {
    const newWallet = ethers.Wallet.createRandom();
    setWallet({
      address: newWallet.address,
      privateKey: newWallet.privateKey,
      mnemonic: newWallet.mnemonic.phrase,
    });
    setStep(2);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!confirmed) {
      setError("Please confirm you have saved your private key.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8081/api/v1/blockchain/identity/setup-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setupToken: token,
          walletAddress: wallet.address,
        }),
      });

      const data = await res.json();
      if (data.status === "SUCCESS") {
        setStep(3);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (!token || error && step === 1) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f8fafc" }}>
        <div style={{ background: "#fff", padding: "40px", borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", textAlign: "center", maxWidth: "400px" }}>
          <AlertCircle size={48} color="#ef4444" style={{ marginBottom: "20px" }} />
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>Access Denied</h2>
          <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.6 }}>{error || "Invalid or expired setup token. Please contact your Panchayat Administrator for a new link."}</p>
          <button onClick={() => navigate("/")} style={{ marginTop: "24px", padding: "12px 24px", background: "#000b60", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer" }}>Return Home</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "60px 24px", fontFamily: "'Manrope', sans-serif" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", background: "#fff", borderRadius: "24px", boxShadow: "0 20px 50px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        
        {/* Header */}
        <div style={{ background: "#000b60", padding: "40px", color: "#fff", textAlign: "center" }}>
          <ShieldCheck size={40} color="#8390f2" style={{ marginBottom: "16px" }} />
          <h1 style={{ fontSize: "24px", fontWeight: 800 }}>Blockchain Identity Setup</h1>
          <p style={{ opacity: 0.8, fontSize: "14px", marginTop: "8px" }}>Provisioning secure voting credentials for {user?.fullName || "Ward Member"}</p>
        </div>

        <div style={{ padding: "40px" }}>
          {step === 1 && (
            <div>
              <div style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px", color: "#1e293b" }}>Welcome to the Consensus Module</h2>
                <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.6 }}>
                  As a {user?.role === "PRESIDENT" ? "President" : "Ward Member"}, your decisions are recorded on a blockchain. 
                  To cast votes, you need a digital signature. We will now generate your private blockchain keys.
                </p>
              </div>

              <div style={{ background: "#f1f5f9", padding: "20px", borderRadius: "16px", marginBottom: "32px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "#475569" }}>How it works:</h3>
                <ul style={{ paddingLeft: "20px", color: "#64748b", fontSize: "13px", lineHeight: 1.8 }}>
                  <li>Your keys are generated <strong>locally in your browser</strong>.</li>
                  <li>Your Private Key is never sent to the server.</li>
                  <li>You must save your Private Key to MetaMask manually.</li>
                </ul>
              </div>

              <button 
                onClick={handleGenerate}
                style={{ width: "100%", padding: "16px", background: "#000b60", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
              >
                Generate My Secure Wallet <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && wallet && (
            <div>
              <div style={{ marginBottom: "24px", padding: "16px", background: "#f0fdf4", borderRadius: "12px", border: "1px solid #dcfce7" }}>
                <p style={{ fontSize: "11px", fontWeight: 800, color: "#166534", marginBottom: "4px", textTransform: "uppercase" }}>Your Public Address (Shareable ID)</p>
                <code style={{ fontSize: "13px", color: "#166534", wordBreak: "break-all" }}>{wallet.address}</code>
              </div>

              <div style={{ marginBottom: "24px", padding: "20px", background: "#fff7ed", borderRadius: "16px", border: "2px solid #fdba74" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <AlertCircle size={20} color="#ea580c" />
                  <p style={{ fontSize: "14px", fontWeight: 800, color: "#9a3412" }}>PRIVATE KEY - ACTION REQUIRED</p>
                </div>
                <p style={{ fontSize: "12px", color: "#c2410c", marginBottom: "16px", lineHeight: 1.5 }}>
                  This key will <strong>NEVER</strong> be shown again. It is your only way to approve funds. 
                  Copy it now and import it into MetaMask.
                </p>
                <div style={{ background: "#fff", padding: "12px", borderRadius: "8px", border: "1px solid #fed7aa", display: "flex", alignItems: "center", gap: "10px", position: "relative" }}>
                   <code style={{ fontSize: "12px", flex: 1, wordBreak: "break-all", color: "#9a3412" }}>{wallet.privateKey}</code>
                   <button onClick={() => handleCopy(wallet.privateKey)} style={{ background: "#ea580c", color: "#fff", border: "none", padding: "8px", borderRadius: "6px", cursor: "pointer" }}>
                     {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                   </button>
                </div>
              </div>

              <div style={{ marginBottom: "32px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px" }}>Import Instructions:</h3>
                <ol style={{ fontSize: "13px", color: "#64748b", paddingLeft: "20px", lineHeight: 1.8 }}>
                  <li>Open MetaMask Extension</li>
                  <li>Click Account Icon (Circle) → <strong>Import Account</strong></li>
                  <li>Paste the Private Key above</li>
                </ol>
              </div>

              <label style={{ display: "flex", gap: "12px", alignItems: "start", cursor: "pointer", marginBottom: "24px" }}>
                <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} style={{ marginTop: "3px" }} />
                <span style={{ fontSize: "13px", color: "#475569", lineHeight: 1.5 }}>
                  I have securely saved my Private Key and understand that it cannot be recovered if lost.
                </span>
              </label>

              {error && <div style={{ color: "#ef4444", fontSize: "12px", marginBottom: "16px", fontWeight: 600 }}>{error}</div>}

              <button 
                disabled={loading || !confirmed}
                onClick={handleSubmit}
                style={{ width: "100%", padding: "16px", background: "#000b60", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 800, cursor: loading || !confirmed ? "not-allowed" : "pointer", opacity: loading || !confirmed ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
              >
                {loading ? <RefreshCcw className="animate-spin" size={18} /> : "Finalize Registration"}
              </button>
            </div>
          )}

          {step === 3 && (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "80px", height: "80px", background: "#f0fdf4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <CheckCircle2 size={40} color="#22c55e" />
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "12px" }}>Setup Complete!</h2>
              <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.6, marginBottom: "32px" }}>
                Your blockchain identity has been registered. The Panchayat Administrator will now activate your wallet on the smart contract.
              </p>
              <button 
                onClick={() => navigate("/login")}
                style={{ width: "100%", padding: "16px", background: "#000b60", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 800, cursor: "pointer" }}
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
