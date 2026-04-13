export default function Navbar({ currentPage, navigate, authUser, onLogout }) {
  const isLoggedIn = !!authUser;
  const role = authUser?.role;

  const navItems = [
    { id: "home",       label: "Home" },
    { id: "complaints", label: "Complaints" },
    { id: "track",      label: "Track" },
    { id: "funds",      label: "Funds" },
    { id: "map",        label: "Map" },
    // Staff links — only shown when logged in
    ...(role === "ADMIN"       ? [{ id: "admin", label: "🔴 Admin" }] : []),
    ...(role === "WARD_MEMBER" ? [{ id: "ward",  label: "🟢 My Ward" }] : []),
  ];

  const initials = authUser?.fullName
    ? authUser.fullName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <nav style={{
      background: "#fff",
      borderBottom: "1px solid #e5e7eb",
      padding: "0 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "64px",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
    }}>
      {/* Logo */}
      <div
        style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
        onClick={() => navigate("home")}
      >
        <div style={{
          width: "36px", height: "36px", borderRadius: "8px",
          background: "linear-gradient(135deg, #1d4ed8, #06b6d4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "18px"
        }}>🏛️</div>
        <span style={{ fontWeight: 700, fontSize: "17px", color: "#111827" }}>SmartPanchayat</span>
      </div>

      {/* Nav links */}
      <div style={{ display: "flex", gap: "2px", overflowX: "auto" }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            style={{
              padding: "8px 14px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: currentPage === item.id ? 700 : 400,
              color: currentPage === item.id ? "#1d4ed8" : "#6b7280",
              borderBottom: currentPage === item.id ? "2px solid #1d4ed8" : "2px solid transparent",
              transition: "all 0.2s",
              fontFamily: "inherit",
              whiteSpace: "nowrap"
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Right: auth area */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {isLoggedIn ? (
          <>
            {/* Avatar + name */}
            <div
              onClick={() => navigate(role === "ADMIN" ? "admin" : "ward")}
              style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
            >
              <div style={{
                width: "34px", height: "34px", borderRadius: "50%",
                background: role === "ADMIN"
                  ? "linear-gradient(135deg, #dc2626, #991b1b)"
                  : "linear-gradient(135deg, #059669, #065f46)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: "12px", fontWeight: 700
              }}>{initials}</div>
              <span style={{ fontSize: "13px", color: "#374151", fontWeight: 500, maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {authUser?.fullName?.split(" ")[0] || authUser?.username}
              </span>
            </div>
            {/* Logout */}
            <button
              onClick={onLogout}
              style={{
                padding: "6px 14px",
                background: "#fee2e2", color: "#dc2626",
                border: "none", borderRadius: "8px",
                cursor: "pointer", fontSize: "12px",
                fontWeight: 600, fontFamily: "inherit"
              }}
            >
              Logout
            </button>
          </>
        ) : (
          /* Staff Login button */
          <button
            onClick={() => navigate("login")}
            style={{
              padding: "8px 16px",
              background: "linear-gradient(135deg, #1d4ed8, #1e40af)",
              color: "#fff", border: "none", borderRadius: "8px",
              cursor: "pointer", fontSize: "13px",
              fontWeight: 600, fontFamily: "inherit"
            }}
          >
            🔐 Staff Login
          </button>
        )}
      </div>
    </nav>
  );
}