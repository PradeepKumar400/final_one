import React, { useEffect, useState } from 'react';
import { User, Shield, Landmark, MapPin, Phone, Mail, Award, Clock, Users, ShieldCheck } from 'lucide-react';
import { getStaffList, getToken } from '../utils/api';
import ConnectWalletButton from './ConnectWalletButton';

// Reads live MetaMask account and compares with registered wallet
function MetaMaskStatus({ registeredWallet }) {
    const [liveAccount, setLiveAccount] = useState(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const check = async () => {
            if (!window.ethereum) { setChecking(false); return; }
            try {
                const accounts = await window.ethereum.request({ 
                    method: "eth_accounts" 
                });
                setLiveAccount(accounts[0] || null);
            } catch {
                setLiveAccount(null);
            }
            setChecking(false);
        };
        check();

        // Update when user switches MetaMask account
        const handleAccountsChanged = (accounts) => {
            setLiveAccount(accounts[0] || null);
        };
        window.ethereum?.on("accountsChanged", handleAccountsChanged);
        
        return () => {
             window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
        };
    }, []);

    if (checking) return null;

    const isMatch = liveAccount && registeredWallet &&
        liveAccount.toLowerCase() === registeredWallet.toLowerCase();

    const isConnectedButWrong = liveAccount && registeredWallet && !isMatch;
    const notConnected = !liveAccount;
    const noWalletRegistered = !registeredWallet;

    return (
        <div style={{ 
            padding: "14px 16px", borderRadius: "12px",
            border: `1px solid ${isMatch ? "#4ade8044" : "#f8717144"}`,
            background: isMatch ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
            display: "flex", alignItems: "center", gap: "10px"
        }}>
            <div style={{ 
                width: "10px", height: "10px", borderRadius: "50%",
                background: isMatch ? "#4ade80" : "#f87171",
                flexShrink: 0
            }} />
            <div style={{ flex: 1 }}>
                {isMatch && (
                    <>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "#4ade80" }}>
                            ✅ MetaMask Connected
                        </div>
                        <div style={{ fontSize: "11px", color: "#a5b4fc", marginTop: "2px", fontFamily: "monospace", wordBreak: "break-all" }}>
                            Active Wallet: {liveAccount}
                        </div>
                    </>
                )}
                {isConnectedButWrong && (
                    <>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "#f87171" }}>
                            ⚠️ Wrong MetaMask Account
                        </div>
                        <div style={{ fontSize: "11px", color: "#fca5a5", marginTop: "2px" }}>
                            Switch to your registered wallet in MetaMask
                        </div>
                    </>
                )}
                {notConnected && !noWalletRegistered && (
                    <>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "#f87171" }}>
                            MetaMask Not Connected
                        </div>
                        <div style={{ fontSize: "11px", color: "#fca5a5", marginTop: "2px" }}>
                            Open MetaMask and connect your account
                        </div>
                    </>
                )}
                {noWalletRegistered && (
                    <>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "#94a3b8" }}>
                            No Wallet Registered
                        </div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                            Click "Connect Wallet" below to link your identity
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function ProfilePage({ user }) {
    const [staff, setStaff] = useState([]);
    const [loadingStaff, setLoadingStaff] = useState(false);

    useEffect(() => {
        if (user?.role === "ADMIN") {
            setLoadingStaff(true);
            getStaffList()
                .then(data => setStaff(data))
                .catch(err => console.error("Failed to fetch staff:", err))
                .finally(() => setLoadingStaff(false));
        }
    }, [user]);

    if (!user) return null;

    const COLORS = {
        primary: "#1e1b4b",
        secondary: "#6366f1",
        accent: "#4f46e5",
        bg: "#f8fafc"
    };

    const infoCardStyle = {
        background: "#fff",
        borderRadius: "20px",
        padding: "30px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
        gap: "16px"
    };

    const labelStyle = {
        fontSize: "12px",
        fontWeight: 700,
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: "0.05em"
    };

    const valueStyle = {
        fontSize: "16px",
        fontWeight: 600,
        color: "#1e293b"
    };

    return (
        <div style={{ padding: "120px 48px 60px", background: COLORS.bg, minHeight: "100vh" }}>
            <div style={{ maxWidth: "100%", margin: "0 auto" }}>
                
                {/* Header Section */}
                <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "40px" }}>
                    <div style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "32px",
                        background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: "36px",
                        fontWeight: 800,
                        boxShadow: "0 20px 25px -5px rgba(79, 70, 229, 0.2)"
                    }}>
                        {user.fullName?.[0] || user.username?.[0]}
                    </div>
                    <div>
                        <h1 style={{ fontSize: "32px", fontWeight: 800, color: COLORS.primary, margin: "0 0 8px" }}>
                            {user.fullName || "User Profile"}
                        </h1>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{
                                padding: "6px 12px",
                                background: "#e0e7ff",
                                color: "#4338ca",
                                borderRadius: "100px",
                                fontSize: "12px",
                                fontWeight: 700,
                                textTransform: "uppercase"
                            }}>
                                {user.role?.replace("_", " ")}
                            </span>
                            <span style={{ color: "#64748b", fontSize: "14px", fontWeight: 500 }}>
                                Member since {new Date().getFullYear()}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "32px" }}>
                    
                    {/* Left Column: Personal Info */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                        <div style={infoCardStyle}>
                            <h3 style={{ fontSize: "18px", fontWeight: 800, color: COLORS.primary, margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                                <User size={20} color={COLORS.accent} /> Personal Information
                            </h3>
                            
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                                <div>
                                    <label style={labelStyle}>Official Username</label>
                                    <div style={valueStyle}>{user.username}</div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Contact Number</label>
                                    <div style={valueStyle}>{user.phone || "Not Provided"}</div>
                                </div>
                            </div>
                        </div>

                        {/* Module 1: Blockchain Identity Card */}
                        <div style={{ 
                            ...infoCardStyle, 
                            background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
                            border: "none",
                            color: "#fff"
                        }}>
                            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                                <Shield size={20} color="#818cf8" /> Blockchain Identity
                            </h3>
                            <p style={{ fontSize: "13px", color: "#a5b4fc", margin: "-8px 0 16px" }}>
                                Your cryptographic signature identity for panchayat governance.
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                                {/* MetaMask Live Status — same as fund page */}
                                <MetaMaskStatus registeredWallet={user.walletAddress} />

                                {/* Wallet Address from backend */}
                                <div style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                                    <label style={{ ...labelStyle, color: "#818cf8" }}>
                                        Wallet ID (Public Address)
                                    </label>
                                    <div style={{ 
                                        color: "#fff", fontFamily: "monospace", 
                                        marginTop: "4px", fontSize: "13px",
                                        wordBreak: "break-all"
                                    }}>
                                        {user.walletAddress 
                                            ? user.walletAddress 
                                            : "Not connected — click button below to connect"}
                                    </div>
                                </div>

                                {/* Blockchain Status */}
                                <div style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                                    <label style={{ ...labelStyle, color: "#818cf8" }}>Identity Status</label>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                                        <div style={{ 
                                            width: "8px", height: "8px", borderRadius: "50%", 
                                            background: user.walletStatus === "ACTIVE" ? "#4ade80" : "#94a3b8" 
                                        }}></div>
                                        <span style={{ fontWeight: 600, color: "#fff" }}>
                                            {user.walletStatus === "ACTIVE" 
                                                ? "Verified on Blockchain" 
                                                : "Pending — Wallet not connected"}
                                        </span>
                                    </div>
                                </div>

                                {/* Role on blockchain */}
                                <div style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                                    <label style={{ ...labelStyle, color: "#818cf8" }}>Blockchain Role</label>
                                    <div style={{ 
                                        marginTop: "6px",
                                        display: "inline-flex", alignItems: "center", gap: "8px",
                                        background: user.role === "PRESIDENT" ? "#7c3aed" : "#1d4ed8",
                                        padding: "6px 14px", borderRadius: "100px",
                                        fontSize: "12px", fontWeight: 800, color: "#fff"
                                    }}>
                                        {user.role === "PRESIDENT" ? "👑 PRESIDENT" : "🗳️ WARD MEMBER"}
                                    </div>
                                </div>

                                {/* MetaMask Connection Button */}
                                {(user.role === "PRESIDENT" || user.role === "WARD_MEMBER") && (
                                    <div style={{ marginTop: "8px" }}>
                                        <ConnectWalletButton currentUser={user} authToken={getToken()} />
                                    </div>
                                )}
                            </div>
                        </div>

                        </div>

                    {/* Right Column: Ward & System Info */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                        <div style={infoCardStyle}>
                            <h3 style={{ fontSize: "18px", fontWeight: 800, color: COLORS.primary, margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                                <Landmark size={20} color={COLORS.accent} /> Jurisdictional Detail
                            </h3>
                            
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyCenter: "center", color: "#64748b" }}>
                                        <MapPin size={20} style={{ margin: "auto" }} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Assigned Ward</label>
                                        <div style={valueStyle}>{user.wardName || "General Access"}</div>
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyCenter: "center", color: "#64748b" }}>
                                        <Landmark size={20} style={{ margin: "auto" }} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Ward ID Number</label>
                                        <div style={valueStyle}>{user.wardId || "N/A"}</div>
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyCenter: "center", color: "#64748b" }}>
                                        <Award size={20} style={{ margin: "auto" }} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Privilege Level</label>
                                        <div style={valueStyle}>{user.role === "ADMIN" ? "Full Control" : "Consensus Member"}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            padding: "24px",
                            borderRadius: "20px",
                            background: "#eff6ff",
                            border: "1px solid #dbeafe",
                            textAlign: "center"
                        }}>
                            <Clock size={32} color="#3b82f6" style={{ margin: "0 auto 16px" }} />
                            <h4 style={{ margin: "0 0 8px", fontSize: "16px", color: "#1e40af" }}>System Status</h4>
                            <p style={{ margin: 0, fontSize: "13px", color: "#60a5fa", fontWeight: 500 }}>
                                Your account is active and synced with the SmartPanchayat network.
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- FULL WIDTH STAFF ROSTER (Admin Only) --- */}
                {user.role === "ADMIN" && (
                    <div style={{ ...infoCardStyle, width: "100%", marginTop: "32px", boxSizing: "border-box" }}>
                        <h3 style={{ fontSize: "22px", fontWeight: 800, color: COLORS.primary, margin: 0, display: "flex", alignItems: "center", gap: "12px" }}>
                            <Users size={24} color={COLORS.accent} /> Official Staff Roster
                        </h3>
                        <p style={{ fontSize: "14px", color: "#64748b", margin: "-8px 0 20px" }}>
                            A complete overview of all registered officials and their blockchain wallet statuses across all wards.
                        </p>

                        {loadingStaff ? (
                            <div style={{ textAlign: "center", padding: "40px" }}>
                                <Clock size={24} className="animate-spin" style={{ margin: "0 auto 12px", color: COLORS.accent }} />
                                <p style={{ color: "#64748b" }}>Synchronizing Ledger...</p>
                            </div>
                        ) : (
                            <div style={{ 
                                display: "grid", 
                                gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", 
                                gap: "16px",
                                maxHeight: "600px",
                                overflowY: "auto",
                                paddingRight: "12px"
                            }}>
                                {staff.map((member, idx) => (
                                    <div key={idx} style={{ 
                                        display: "flex", 
                                        justifyContent: "space-between", 
                                        alignItems: "center", 
                                        padding: "16px 20px", 
                                        background: "#f8fafc", 
                                        borderRadius: "16px",
                                        border: "1px solid #f1f5f9",
                                        transition: "transform 0.2s, box-shadow 0.2s",
                                        cursor: "default"
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                            <div style={{ 
                                                width: "48px", 
                                                height: "48px", 
                                                borderRadius: "14px", 
                                                background: member.role === "PRESIDENT" ? "#fff1f2" : "#f0f9ff", 
                                                display: "flex", 
                                                alignItems: "center", 
                                                justifyContent: "center", 
                                                color: member.role === "PRESIDENT" ? "#e11d48" : "#0369a1", 
                                                fontSize: "18px", 
                                                fontWeight: 800 
                                            }}>
                                                {member.fullName?.[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>{member.fullName}</div>
                                                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                                                    {member.role?.replace("_", " ")} • {member.wardName || "Admin Office"} ({member.wardId || "N/A"})
                                                </div>
                                                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "6px", fontFamily: "monospace" }}>ID: {member.userId}</div>
                                                {member.walletId && (
                                                    <div style={{ fontSize: "11px", color: "#6366f1", marginTop: "3px", fontFamily: "monospace", display: "flex", alignItems: "center", gap: "4px" }}>
                                                        <Shield size={10} /> Wallet: {member.walletId}
                                                    </div>
                                                )}
                                                {member.role === "WARD_MEMBER" && (
                                                    <div style={{ 
                                                        marginTop: "8px", 
                                                        fontSize: "11px", 
                                                        fontWeight: 700, 
                                                        color: member.pendingComplaintsCount > 0 ? "#e11d48" : "#64748b",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "4px"
                                                    }}>
                                                        <FileText size={12} /> {member.pendingComplaintsCount || 0} Pending Issues
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {member.walletId && (
                                            <div style={{ 
                                                display: "flex", 
                                                alignItems: "center", 
                                                gap: "6px", 
                                                color: "#059669", 
                                                fontSize: "11px", 
                                                fontWeight: 800, 
                                                background: "#ecfdf5", 
                                                padding: "6px 12px", 
                                                borderRadius: "100px",
                                                border: "1px solid #d1fae5"
                                            }}>
                                                <ShieldCheck size={14} /> ACTIVE
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
