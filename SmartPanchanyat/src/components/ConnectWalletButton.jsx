import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/web3Config";
import {
  connectWallet as apiConnectWallet,
  updateLocalWallet,
  getUser,
  getToken,
} from "../utils/api";

// Hardhat Account #0 — admin who deployed the contract (local dev only)
const ADMIN_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

export default function ConnectWalletButton({ currentUser, authToken }) {
  const user = currentUser;
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connectedAddress, setConnectedAddress] = useState(
    user?.walletAddress || null,
  );

  const handleConnect = async () => {
    setError("");
    setLoading(true);

    try {
      if (!window.ethereum) {
        throw new Error(
          "MetaMask not found. Please install the MetaMask extension.",
        );
      }

      // Step 1: Force MetaMask to show account selection popup
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      // Step 2: Now get the selected account
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error(
          "No account selected. Please select an account in MetaMask.",
        );
      }

      const address = accounts[0];

      // Step 3: Make sure MetaMask is on Hardhat network (0x7a69 = 31337)
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== "0x7a69") {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x7a69" }],
          });
        } catch (switchError) {
          // Network not added yet — add it automatically
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x7a69",
                  chainName: "Hardhat Local",
                  rpcUrls: ["http://127.0.0.1:8545"],
                  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }

      // Step 4: Save to backend
      const res = await fetch(
        "http://localhost:8081/api/v1/blockchain/identity/connect-wallet",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ walletAddress: address }),
        },
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || data.message || "Backend save failed");

      // Step 5: Register on blockchain (admin pays gas)
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const adminSigner = new ethers.Wallet(
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        provider,
      );
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        adminSigner,
      );

      if (user.role === "PRESIDENT") {
        const tx = await contract.registerPresident(address);
        await tx.wait();
      } else {
        const tx = await contract.registerWardMember(address);
        await tx.wait();
      }

      // Step 6: Update local state
      updateLocalWallet(address);
      setConnectedAddress(address);
      setShowModal(false);
    } catch (err) {
      if (err.code === 4001) {
        setError("You cancelled the MetaMask request. Please try again.");
      } else {
        console.error(err);
        setError(err.message || "Something went wrong.");
      }
    }

    setLoading(false);
  };

  // ── Already connected — green pill ──
  if (connectedAddress) {
    return (
      <button
        onClick={() => setShowModal(true)}
        style={{
          background: "#16a34a",
          color: "white",
          border: "none",
          borderRadius: 20,
          padding: "8px 16px",
          fontWeight: 700,
          cursor: "pointer",
          fontSize: 12,
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        ✅ {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
      </button>
    );
  }

  // ── Not connected — orange button ──
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          background: "#f97316",
          color: "white",
          border: "none",
          borderRadius: 20,
          padding: "8px 16px",
          fontWeight: 700,
          cursor: "pointer",
          fontSize: 12,
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        🔗 Connect Wallet
      </button>

      {showModal && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: 36,
              width: 440,
              boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🦊</div>
              <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800 }}>
                Connect MetaMask
              </h2>
              <p
                style={{
                  color: "#666",
                  fontSize: 14,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Your MetaMask wallet will become your permanent digital identity
                in GramaNiti. Every vote you cast will be signed by this wallet.
              </p>
            </div>

            {/* What happens */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 16,
                textAlign: "left",
                marginBottom: 24,
                fontSize: 13,
                lineHeight: 1.7,
                color: "#475569",
              }}
            >
              <p
                style={{ margin: "0 0 6px", fontWeight: 800, color: "#1e293b" }}
              >
                What happens when you connect:
              </p>
              <p style={{ margin: "0 0 4px" }}>
                1️⃣ MetaMask opens — select your ward member account
              </p>
              <p style={{ margin: "0 0 4px" }}>
                2️⃣ Your wallet address is saved to your profile
              </p>
              <p style={{ margin: 0 }}>
                3️⃣ You are registered on the blockchain immediately ⛓️
              </p>
            </div>

            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fca5a5",
                  borderRadius: 10,
                  padding: 14,
                  color: "#dc2626",
                  fontSize: 13,
                  marginBottom: 16,
                  lineHeight: 1.4,
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handleConnect}
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "#d1d5db" : "#f97316",
                color: "white",
                border: "none",
                borderRadius: 12,
                padding: "14px",
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              {loading
                ? "Connecting & Registering on Blockchain..."
                : "🦊 Connect MetaMask"}
            </button>

            <button
              onClick={() => {
                setShowModal(false);
                setError("");
              }}
              style={{
                marginTop: 12,
                width: "100%",
                background: "none",
                border: "none",
                color: "#9ca3af",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "inherit",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
