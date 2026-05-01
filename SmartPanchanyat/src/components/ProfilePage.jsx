import React, { useEffect, useState } from 'react';
import { User, Shield, Landmark, MapPin, Phone, Mail, Award, Clock, Users, ShieldCheck } from 'lucide-react';
import { getStaffList } from '../utils/api';

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
                                <div style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                                    <label style={{ ...labelStyle, color: "#818cf8" }}>Wallet ID (Public Address)</label>
                                    <div style={{ ...valueStyle, color: "#fff", fontFamily: "monospace", marginTop: "4px", fontSize: "14px" }}>
                                        {user.walletId || "WALLET_NOT_INITIALIZED"}
                                    </div>
                                </div>

                                <div style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                                    <label style={{ ...labelStyle, color: "#818cf8" }}>Identity Status</label>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: user.walletId ? "#4ade80" : "#94a3b8" }}></div>
                                        <span style={{ fontWeight: 600 }}>{user.walletId ? "Verified on Blockchain" : "Pending Provisioning"}</span>
                                    </div>
                                </div>
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
