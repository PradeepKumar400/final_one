import React, { useEffect, useState } from 'react';
import { 
  User, 
  Shield, 
  Landmark, 
  MapPin, 
  Phone, 
  Mail, 
  Award, 
  Clock, 
  Users, 
  ShieldCheck, 
  Edit3, 
  ChevronRight,
  Briefcase,
  Home,
  Save,
  X
} from 'lucide-react';
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
                const accounts = await window.ethereum.request({ method: "eth_accounts" });
                setLiveAccount(accounts[0] || null);
            } catch {
                setLiveAccount(null);
            }
            setChecking(false);
        };
        check();
        const handleAccountsChanged = (accounts) => setLiveAccount(accounts[0] || null);
        window.ethereum?.on("accountsChanged", handleAccountsChanged);
        return () => window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
    }, []);

    if (checking) return null;
    const isMatch = liveAccount && registeredWallet && liveAccount.toLowerCase() === registeredWallet.toLowerCase();
    const noWalletRegistered = !registeredWallet;

    return (
        <div style={{ 
            padding: "14px 16px", borderRadius: "12px",
            border: `1px solid ${isMatch ? "#4ade8044" : "#f8717144"}`,
            background: isMatch ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
            display: "flex", alignItems: "center", gap: "10px"
        }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: isMatch ? "#4ade80" : "#f87171" }} />
            <div style={{ flex: 1 }}>
                {isMatch ? (
                    <>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "#4ade80" }}>✅ MetaMask Connected</div>
                        <div style={{ fontSize: "11px", color: "#a5b4fc", marginTop: "2px", fontFamily: "monospace" }}>Active: {liveAccount}</div>
                    </>
                ) : (
                    <>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "#f87171" }}>{noWalletRegistered ? "No Wallet Registered" : "⚠️ Wrong MetaMask Account"}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{noWalletRegistered ? "Click Connect Wallet below" : "Switch to your registered wallet"}</div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function ProfilePage({ user }) {
    const [staff, setStaff] = useState([]);
    const [loadingStaff, setLoadingStaff] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState({
        fullName: user?.fullName || "",
        phone: user?.phone || "",
        address: user?.address || "Street 4, Ward 2, SmartPanchayat",
        email: user?.email || "citizen@example.com"
    });

    useEffect(() => {
        // All roles can see the staff roster for transparency
        setLoadingStaff(true);
        getStaffList()
            .then(data => setStaff(data))
            .catch(err => console.error("Failed to fetch staff:", err))
            .finally(() => setLoadingStaff(false));
    }, []);

    if (!user) return null;

    const COLORS = {
        primary: "#1e1b4b",
        secondary: "#6366f1",
        accent: "#4f46e5",
        bg: "#f8fafc"
    };

    const infoCardStyle = {
        background: "#fff",
        borderRadius: "24px",
        padding: "32px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        display: "flex",
        flexDirection: "column",
        gap: "20px"
    };

    const labelStyle = { fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" };
    const valueStyle = { fontSize: "15px", fontWeight: 700, color: "#1e293b" };

    const isCitizen = user.role === "CITIZEN" || user.role === "USER";

    return (
        <div style={{ padding: "100px 48px 60px", background: COLORS.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                
                {/* --- Header Profile Section --- */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                        <div style={{
                            width: "120px", height: "120px", borderRadius: "32px",
                            background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontSize: "40px", fontWeight: 900,
                            boxShadow: "0 20px 25px -5px rgba(79, 70, 229, 0.2)"
                        }}>
                            {editedUser.fullName?.[0] || user.username?.[0]}
                        </div>
                        <div>
                            <h1 style={{ fontSize: "36px", fontWeight: 900, color: COLORS.primary, margin: "0 0 8px", letterSpacing: "-1px" }}>
                                {editedUser.fullName}
                            </h1>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <span style={{
                                    padding: "6px 16px", background: isCitizen ? "#f0f9ff" : "#e0e7ff",
                                    color: isCitizen ? "#0369a1" : "#4338ca", borderRadius: "100px",
                                    fontSize: "12px", fontWeight: 800, textTransform: "uppercase"
                                }}>
                                    {user.role?.replace("_", " ")}
                                </span>
                                <span style={{ color: "#64748b", fontSize: "14px", fontWeight: 600 }}>Panchayat Member since 2026</span>
                            </div>
                        </div>
                    </div>
                    {!isEditing ? (
                        <button 
                            onClick={() => setIsEditing(true)}
                            style={{ padding: "12px 24px", background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: COLORS.accent }}
                        >
                            <Edit3 size={18} /> Edit Profile
                        </button>
                    ) : (
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button onClick={() => setIsEditing(false)} style={{ padding: "12px 24px", background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: "12px", fontWeight: 800, cursor: "pointer" }}>
                                <X size={18} /> Cancel
                            </button>
                            <button onClick={() => setIsEditing(false)} style={{ padding: "12px 24px", background: "#10b981", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                                <Save size={18} /> Save Changes
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "32px" }}>
                    
                    {/* Left Column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                        
                        {/* 1. Personal Information */}
                        <div style={infoCardStyle}>
                            <h3 style={{ fontSize: "18px", fontWeight: 800, color: COLORS.primary, margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                                <User size={20} color={COLORS.accent} /> Personal Information
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                                <div>
                                    <label style={labelStyle}>Full Name</label>
                                    {isEditing ? (
                                        <input style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={editedUser.fullName} onChange={e => setEditedUser({...editedUser, fullName: e.target.value})} />
                                    ) : <div style={valueStyle}>{editedUser.fullName}</div>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Contact Number</label>
                                    {isEditing ? (
                                        <input style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={editedUser.phone} onChange={e => setEditedUser({...editedUser, phone: e.target.value})} />
                                    ) : <div style={valueStyle}>{editedUser.phone || "Not Provided"}</div>}
                                </div>
                                <div style={{ gridColumn: "span 2" }}>
                                    <label style={labelStyle}>Residential Address</label>
                                    {isEditing ? (
                                        <input style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={editedUser.address} onChange={e => setEditedUser({...editedUser, address: e.target.value})} />
                                    ) : <div style={valueStyle}>{editedUser.address}</div>}
                                </div>
                            </div>
                        </div>

                        {/* 2. Staff Directory (Citizen's view of Officials) */}
                        <div style={infoCardStyle}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <h3 style={{ fontSize: "18px", fontWeight: 800, color: COLORS.primary, margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                                    <Users size={20} color={COLORS.accent} /> Panchayat Officials Directory
                                </h3>
                                <span style={{ fontSize: "12px", fontWeight: 700, color: "#10b981", background: "#f0fdf4", padding: "4px 12px", borderRadius: "100px" }}>
                                    Verified Profiles
                                </span>
                            </div>
                            <div style={{ display: "grid", gap: "12px" }}>
                                {loadingStaff ? <p>Loading directory...</p> : (
                                    staff.map((s, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", background: "#f8fafc", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
                                            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: s.role === "PRESIDENT" ? "#fff1f2" : "#f0f9ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: s.role === "PRESIDENT" ? "#e11d48" : "#0369a1" }}>
                                                {s.fullName?.[0]}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: "14px", fontWeight: 800, color: "#1e293b" }}>{s.fullName}</div>
                                                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>{s.role?.replace("_", " ")} • Ward: {s.wardName || "Main Office"}</div>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>Status</div>
                                                <div style={{ fontSize: "11px", fontWeight: 800, color: "#059669" }}>Active</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* 3. Blockchain (Staff only) */}
                        {!isCitizen && (
                            <div style={{ ...infoCardStyle, background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)", border: "none", color: "#fff" }}>
                                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                                    <Shield size={20} color="#818cf8" /> Blockchain Identity
                                </h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    <MetaMaskStatus registeredWallet={user.walletAddress} />
                                    <ConnectWalletButton currentUser={user} authToken={getToken()} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                        <div style={infoCardStyle}>
                            <h3 style={{ fontSize: "16px", fontWeight: 800, color: COLORS.primary, margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                                <Landmark size={18} color={COLORS.accent} /> Community Access
                            </h3>
                            <div style={{ display: "grid", gap: "16px" }}>
                                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                    <div style={{ padding: "10px", background: "#f1f5f9", borderRadius: "10px" }}><Home size={18} color="#64748b" /></div>
                                    <div>
                                        <div style={labelStyle}>Primary Panchayat</div>
                                        <div style={valueStyle}>SmartPanchayat Center</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                    <div style={{ padding: "10px", background: "#f1f5f9", borderRadius: "10px" }}><MapPin size={18} color="#64748b" /></div>
                                    <div>
                                        <div style={labelStyle}>Jurisdiction</div>
                                        <div style={valueStyle}>{user.wardName || "General Resident"}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: "32px", borderRadius: "24px", background: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)", border: "1px solid #bfdbfe", textAlign: "center" }}>
                            <ShieldCheck size={40} color="#3b82f6" style={{ margin: "0 auto 16px" }} />
                            <h4 style={{ margin: "0 0 8px", fontSize: "16px", color: "#1e40af", fontWeight: 800 }}>Account Verified</h4>
                            <p style={{ margin: 0, fontSize: "13px", color: "#3b82f6", fontWeight: 600, lineHeight: 1.5 }}>
                                Your citizen profile is synced with the GramaNiti network.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
