import { 
  Megaphone, 
  Search, 
  Database, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight,
  Activity,
  Droplets,
  Zap,
  Hammer,
  Clock,
  CheckCircle,
  Pickaxe,
  Construction
} from "lucide-react";

export default function HomePage({ navigate }) {
  const stats = [
    { label: "Total Funds Tracked", value: "₹15,40,000", color: "#4f46e5", bg: "#eef2ff" },
    { label: "Verified Projects", value: "24", color: "#10b981", bg: "#f0fdf4" },
    { label: "Issues Resolved", value: "156", color: "#f59e0b", bg: "#fffbeb" },
  ];

  const feed = [
    { icon: <CheckCircle size={16} />, color: "#10b981", text: "Ward 4 Pipeline Approved", time: "10 mins ago" },
    { icon: <Pickaxe size={16} />, color: "#f97316", text: "Road Repair Completed", time: "1 hour ago" },
    { icon: <Droplets size={16} />, color: "#2563eb", text: "New Water Tank Installation Started", time: "2 hours ago" },
    { icon: <Construction size={16} />, color: "#f59e0b", text: "Overhead Tank Installation", time: "2 hours ago" },
  ];

  const projects = [
    { label: "Water", pct: 35, color: "#2563eb" },
    { label: "Roads", pct: 30, color: "#10b981" },
    { label: "Education", pct: 20, color: "#f59e0b" },
    { label: "Health", pct: 15, color: "#ef4444" },
  ];

  return (
    <div style={{ padding: "80px 48px 40px", maxWidth: "1200px", margin: "0 auto", fontFamily: "'Inter', sans-serif" }}>
      
      {/* ── Hero Section ── */}
      <div style={{ 
        background: "linear-gradient(135deg, #1d4ed8 0%, #0891b2 50%, #059669 100%)", 
        borderRadius: "32px", padding: "64px", color: "white", marginBottom: "40px",
        position: "relative", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
      }}>
        <div style={{ position: "absolute", right: "-10%", top: "-10%", width: "400px", height: "400px", background: "radial-gradient(circle, #3b82f633 0%, transparent 70%)", pointerEvents: "none" }} />
        
        <div style={{ position: "relative", zIndex: 2, maxWidth: "700px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#3b82f622", padding: "6px 16px", borderRadius: "100px", border: "1px solid #3b82f644", marginBottom: "20px", fontSize: "12px", fontWeight: 700, color: "#93c5fd" }}>
            <ShieldCheck size={14} /> SECURED BY BLOCKCHAIN TECHNOLOGY
          </div>
          <h1 style={{ fontSize: "48px", fontWeight: 900, margin: "0 0 16px", lineHeight: 1.1, letterSpacing: "-1px" }}>
            SmartPanchayat <br /><span style={{ color: "#fff", opacity: 0.9 }}>Transparency & Trust</span>
          </h1>
          <p style={{ fontSize: "18px", color: "#fff", opacity: 0.8, lineHeight: 1.6, margin: "0 0 32px" }}>
            Empowering Citizens through Blockchain-Powered Transparency and Trust. Monitor funds and report issues instantly.
          </p>
          
          <div style={{ display: "flex", gap: "16px" }}>
            <button 
              onClick={() => navigate("raise")}
              style={{ padding: "14px 28px", background: "white", color: "#1d4ed8", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", transition: "all 0.2s" }}
            >
              <Megaphone size={18} /> Raise Public Issue
            </button>
            <button 
              onClick={() => navigate("track")}
              style={{ padding: "14px 28px", background: "rgba(255,255,255,0.2)", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
            >
              <Search size={18} /> Track Your Complaint
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "48px" }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: "white", padding: "28px", borderRadius: "24px", border: "1px solid #f1f5f9", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>{s.label}</div>
            <div style={{ fontSize: "32px", fontWeight: 900, color: "#0f172a" }}>{s.value}</div>
            <div style={{ width: "40px", height: "4px", background: s.color, borderRadius: "10px", marginTop: "16px" }} />
          </div>
        ))}
      </div>

      {/* ── Main Features Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "32px", marginBottom: "48px" }}>
        
        {/* Live Activity Feed (Original Mock Data) */}
        <div style={{ 
          background: "white", borderRadius: "28px", padding: "32px", border: "1px solid #f1f5f9", 
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
             <h2 style={{ fontSize: "22px", fontWeight: 800, margin: 0, color: "#0f172a" }}>Live Activity Feed</h2>
             <button onClick={() => navigate("complaints")} style={{ fontSize: "13px", fontWeight: 700, color: "#3b82f6", background: "none", border: "none", cursor: "pointer" }}>View All</button>
          </div>
          
          <div style={{ display: "grid", gap: "12px" }}>
            {feed.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", borderRadius: "16px", background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                 <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: `${f.color}15`, color: f.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {f.icon}
                 </div>
                 <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>{f.text}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>{f.time}</div>
                 </div>
              </div>
            ))}
          </div>
        </div>

        {/* Public Ledger Card */}
        <div 
          onClick={() => navigate("public-ledger")}
          style={{ 
            background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)", 
            borderRadius: "28px", padding: "32px", color: "white", cursor: "pointer",
            display: "flex", flexDirection: "column", justifyContent: "space-between"
          }}
        >
          <div>
            <div style={{ width: "48px", height: "48px", background: "rgba(255,255,255,0.2)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
              <Database size={24} />
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 12px" }}>Public Fund Ledger</h2>
            <p style={{ opacity: 0.8, lineHeight: 1.6, fontSize: "14px" }}>
              Audit every rupee allocated for village projects. 100% blockchain immutability.
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
            <span style={{ fontSize: "14px", fontWeight: 800 }}>Explore Ledger</span>
            <ArrowRight size={20} />
          </div>
        </div>
      </div>

      {/* ── Spending Analysis Row ── */}
      <div style={{ background: "white", borderRadius: "28px", padding: "32px", border: "1px solid #f1f5f9", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
         <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "24px", color: "#0f172a" }}>Budget Allocation Analysis</h2>
         <div style={{ display: "flex", flexWrap: "wrap", gap: "32px", alignItems: "center" }}>
            <div style={{ flex: 1, display: "grid", gap: "16px" }}>
              {projects.map(p => (
                <div key={p.label}>
                   <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>
                      <span>{p.label}</span>
                      <span>{p.pct}%</span>
                   </div>
                   <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${p.pct}%`, background: p.color }} />
                   </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "24px", background: "#f8fafc", borderRadius: "20px", textAlign: "center", minWidth: "200px" }}>
               <Activity size={32} color="#10b981" style={{ marginBottom: "12px" }} />
               <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>Development Score</div>
               <div style={{ fontSize: "32px", fontWeight: 900, color: "#10b981" }}>84%</div>
            </div>
         </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ textAlign: "center", borderTop: "1px solid #f1f5f9", paddingTop: "32px", marginTop: "48px" }}>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px", fontWeight: 600 }}>
          Managed by SmartPanchayat Digital Governance Unit © 2026
        </p>
      </div>
    </div>
  );
}
