import { useState, useEffect } from "react";
import { UserPlus, Trash2, HardHat, Briefcase, Phone, PlusCircle } from "lucide-react";

export default function PresidentWorkerManager() {
  const [workers, setWorkers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWorker, setNewWorker] = useState({
    name: "",
    skill: "Electrician",
    phone: ""
  });

  useEffect(() => {
    const saved = localStorage.getItem("panchayat_workers");
    if (saved) {
      let list = JSON.parse(saved);
      // Migration: Convert old IDs to UUIDs if they are in the "WRK-" format
      let migrated = false;
      const updatedList = list.map(w => {
        if (typeof w.id === 'string' && w.id.startsWith("WRK-")) {
          migrated = true;
          return { ...w, id: crypto.randomUUID() };
        }
        return w;
      });
      if (migrated) {
        saveWorkers(updatedList);
      } else {
        setWorkers(list);
      }
    }
  }, []);

  const saveWorkers = (list) => {
    setWorkers(list);
    localStorage.setItem("panchayat_workers", JSON.stringify(list));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newWorker.name || !newWorker.phone) return;

    const worker = {
      ...newWorker,
      id: crypto.randomUUID()
    };

    const updated = [...workers, worker];
    saveWorkers(updated);
    setNewWorker({ name: "", skill: "Electrician", phone: "" });
    setShowAddForm(false);
  };

  const removeWorker = (id) => {
    if (!confirm("Are you sure you want to remove this worker?")) return;
    const updated = workers.filter(w => w.id !== id);
    saveWorkers(updated);
  };

  return (
    <div style={{ background: "#fff", padding: "32px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Panchayat Worker Directory
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#64748b" }}>
            Maintain a list of verified workers for complaint resolution.
          </p>
        </div>
        {!showAddForm && (
          <button 
            onClick={() => setShowAddForm(true)}
            style={{
              padding: "10px 20px", background: "#000b60", color: "#fff", border: "none",
              borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: 700,
              display: "flex", alignItems: "center", gap: "8px"
            }}
          >
            <PlusCircle size={18} /> Add New Worker
          </button>
        )}
      </div>

      {showAddForm && (
        <form 
          onSubmit={handleAdd}
          style={{ 
            background: "#f8fafc", padding: "24px", borderRadius: "16px", 
            border: "1px solid #e2e8f0", marginBottom: "32px" 
          }}
        >
          <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 800 }}>Register New Worker</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px", color: "#64748b" }}>Worker Name</label>
              <input 
                type="text" required
                value={newWorker.name}
                onChange={e => setNewWorker({...newWorker, name: e.target.value})}
                placeholder="Full Name"
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px", color: "#64748b" }}>Specialization</label>
              <select 
                value={newWorker.skill}
                onChange={e => setNewWorker({...newWorker, skill: e.target.value})}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff" }}
              >
                <option>Electrician</option>
                <option>Plumber</option>
                <option>Road Worker</option>
                <option>Sanitation</option>
                <option>Technician</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px", color: "#64748b" }}>Phone Number</label>
              <input 
                type="tel" required
                value={newWorker.phone}
                onChange={e => setNewWorker({...newWorker, phone: e.target.value})}
                placeholder="10-digit number"
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button type="submit" style={{ padding: "10px 24px", background: "#10b981", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Save Worker</button>
            <button type="button" onClick={() => setShowAddForm(false)} style={{ padding: "10px 24px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
          </div>
        </form>
      )}

      {workers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
          <HardHat size={48} style={{ opacity: 0.2, marginBottom: "16px" }} />
          <p>No workers registered yet. Add your first worker to get started.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {workers.map(w => (
            <div key={w.id} style={{ border: "1px solid #f1f5f9", padding: "20px", borderRadius: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 800, fontSize: "16px", color: "#0f172a" }}>{w.name}</span>
                  <span style={{ padding: "2px 8px", background: "#eef2ff", color: "#4f46e5", fontSize: "10px", fontWeight: 800, borderRadius: "100px", textTransform: "uppercase" }}>{w.skill}</span>
                </div>
                <div style={{ fontSize: "13px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Phone size={12} /> {w.phone}
                </div>
              </div>
              <button 
                onClick={() => removeWorker(w.id)}
                style={{ padding: "8px", color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
