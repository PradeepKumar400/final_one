import { useState } from "react";
import { 
  MapPin, 
  School, 
  GraduationCap, 
  Store, 
  Building2, 
  Hospital, 
  Search, 
  Filter, 
  ChevronRight,
  Info
} from "lucide-react";

export default function MapPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  
  const locations = [
    { id: 1, name: "Panchayat Primary School", type: "primary", category: "school", lat: 12.9716, lng: 77.5946, phone: "080-223344", address: "Ward 2, Main Road" },
    { id: 2, name: "Government Arts College", type: "college", category: "college", lat: 12.9726, lng: 77.5956, phone: "080-556677", address: "Knowledge Park, Ward 4" },
    { id: 3, name: "Central Ration Shop #104", type: "ration", category: "shop", lat: 12.9706, lng: 77.5936, phone: "080-889900", address: "Market Area, Ward 1" },
    { id: 4, name: "Public Health Center", type: "health", category: "hospital", lat: 12.9736, lng: 77.5966, phone: "080-112233", address: "Hospital Road, Ward 3" },
    { id: 5, name: "Village Secondary School", type: "secondary", category: "school", lat: 12.9696, lng: 77.5926, phone: "080-445566", address: "East Wing, Ward 5" },
    { id: 6, name: "Fair Price Shop (Ration)", type: "ration", category: "shop", lat: 12.9746, lng: 77.5976, phone: "080-778899", address: "South Cross, Ward 2" },
  ];

  const filtered = activeFilter === "all" ? locations : locations.filter(l => l.category === activeFilter);

  return (
    <div style={{ padding: "100px 32px 32px", maxWidth: "1400px", margin: "0 auto", height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>
      
      {/* Header & Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#000b60", margin: "0 0 8px" }}>
            Panchayat Geospatial Map
          </h1>
          <p style={{ color: "#64748b", margin: 0 }}>
            Interactive overview of schools, colleges, ration shops, and public infrastructure.
          </p>
        </div>
        
        <div style={{ display: "flex", gap: "12px" }}>
           <div style={{ position: "relative" }}>
             <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
             <input 
               type="text" 
               placeholder="Search locations..." 
               style={{ padding: "10px 16px 10px 36px", borderRadius: "12px", border: "1px solid #e2e8f0", outline: "none", width: "250px", fontSize: "14px" }}
             />
           </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: "24px", flex: 1, minHeight: 0 }}>
        
        {/* Sidebar: List & Filters */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", overflowY: "auto" }}>
          
          {/* Filters */}
          <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, marginBottom: "16px", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
              <Filter size={16} /> Filter by Category
            </h3>
            <div style={{ display: "grid", gap: "8px" }}>
              {[
                { id: "all", label: "All Locations", icon: <MapPin size={14} /> },
                { id: "school", label: "Schools", icon: <School size={14} /> },
                { id: "college", label: "Colleges", icon: <GraduationCap size={14} /> },
                { id: "shop", label: "Ration Shops", icon: <Store size={14} /> },
                { id: "hospital", label: "Health Centers", icon: <Hospital size={14} /> },
              ].map(f => (
                <button 
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  style={{
                    padding: "10px 16px", borderRadius: "10px", border: "1px solid",
                    borderColor: activeFilter === f.id ? "#000b60" : "transparent",
                    background: activeFilter === f.id ? "#000b60" : "white",
                    color: activeFilter === f.id ? "white" : "#475569",
                    cursor: "pointer", fontSize: "13px", fontWeight: 700,
                    display: "flex", alignItems: "center", gap: "10px", transition: "all 0.2s",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                  }}
                >
                  {f.icon} {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location List */}
          <div style={{ flex: 1, overflowY: "auto", display: "grid", gap: "12px", paddingRight: "8px" }}>
            {filtered.map(l => (
              <div 
                key={l.id}
                style={{ 
                  padding: "16px", background: "white", borderRadius: "16px", border: "1px solid #e2e8f0",
                  cursor: "pointer", transition: "all 0.2s"
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = "#000b60"}
                onMouseOut={e => e.currentTarget.style.borderColor = "#e2e8f0"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                   <div style={{ fontSize: "14px", fontWeight: 800, color: "#1e293b" }}>{l.name}</div>
                   {l.category === "school" && <School size={16} color="#3b82f6" />}
                   {l.category === "college" && <GraduationCap size={16} color="#8b5cf6" />}
                   {l.category === "shop" && <Store size={16} color="#f59e0b" />}
                   {l.category === "hospital" && <Hospital size={16} color="#ef4444" />}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                   <MapPin size={12} /> {l.address}
                </div>
                <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
                   <button style={{ padding: "4px 10px", background: "#f1f5f9", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", gap: "4px" }}>
                     Details <ChevronRight size={12} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Map: Google Maps Embed (Simulating the interactive feel) */}
        <div style={{ position: "relative", borderRadius: "28px", overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
           {/* In a real app, you'd use @react-google-maps/api here. 
               For this demo, we use a high-quality Google Maps Iframe + an overlay UI */}
           <iframe 
             width="100%" 
             height="100%" 
             style={{ border: 0 }} 
             loading="lazy" 
             allowFullScreen 
             referrerPolicy="no-referrer-when-downgrade"
             src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15552.02345095394!2d77.5945627!3d12.9715987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1714900000000!5m2!1sen!2sin"
           />

           {/* Floating Info Card */}
           <div style={{ 
             position: "absolute", bottom: "32px", left: "32px", width: "300px",
             background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)",
             padding: "20px", borderRadius: "20px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
             border: "1px solid rgba(255,255,255,0.5)"
           }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                 <div style={{ width: "36px", height: "36px", background: "#000b60", color: "white", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Info size={18} />
                 </div>
                 <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>Panchayat Stats</h4>
              </div>
              <div style={{ display: "grid", gap: "8px" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "#64748b" }}>Total Area</span>
                    <span style={{ fontWeight: 700 }}>4.2 sq.km</span>
                 </div>
                 <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "#64748b" }}>Population</span>
                    <span style={{ fontWeight: 700 }}>12,450</span>
                 </div>
                 <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "#64748b" }}>Villages</span>
                    <span style={{ fontWeight: 700 }}>5 Districts</span>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
