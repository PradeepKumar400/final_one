import { Home, ClipboardList, Search, Landmark, Map, LayoutDashboard, UserCircle, LogOut, LogIn, UserPlus } from "lucide-react";

const COLORS = {
  primary: "#000b60",
  secondary: "#515f74",
  surface: "#f6fafe",
  onSurface: "#171c1f",
  outlineVariant: "#c6c5d4",
  primaryContainer: "#142283",
  onPrimaryContainer: "#8390f2",
  error: "#ba1a1a",
  errorContainer: "#ffdad6"
};

export default function Navbar({ currentPage, navigate, authUser, onLogout }) {
  const isLoggedIn = !!authUser;
  const role = authUser?.role;

  const navItems = [
    { id: "home", label: "Home", icon: <Home size={18} /> },
    { id: "complaints", label: "Complaints", icon: <ClipboardList size={18} /> },
    { id: "track", label: "Track", icon: <Search size={18} /> },
    { id: "funds", label: "Funds", icon: <Landmark size={18} /> },
    { id: "map", label: "Map", icon: <Map size={18} /> },
    ...(role === "ADMIN" ? [{ id: "admin", label: "Admin", icon: <LayoutDashboard size={18} color="#dc2626" /> }] : []),
    ...(role === "WARD_MEMBER" ? [{ id: "ward", label: "My Ward", icon: <LayoutDashboard size={18} color="#16a34a" /> }] : []),
  ];

  const initials = authUser?.fullName
    ? authUser.fullName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const isAuthPage = currentPage === "login" || currentPage === "register";

  return (
    <nav style={{
      position: "fixed",
      top: 0,
      width: "100%",
      zIndex: 50,
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(20px)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0 32px",
      height: "64px",
      boxShadow: "0 1px 2px rgba(0, 11, 96, 0.05)",
      fontFamily: "'Manrope', sans-serif",
      boxSizing: "border-box"
    }}>
      {/* Logo */}
      <div
        style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
        onClick={() => navigate("home")}
      >
        <div style={{ fontSize: "24px", fontWeight: 900, letterSpacing: "-1px", color: COLORS.primary }}>
          SmartPanchayat
        </div>
        {isAuthPage && (
          <div style={{ height: "16px", width: "1px", backgroundColor: COLORS.outlineVariant, margin: "0 8px" }}></div>
        )}
        {isAuthPage && (
          <span style={{ color: COLORS.secondary, fontWeight: 600, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>
            {currentPage === "register" ? "Identity Gateway" : "Authentication Gateway"}
          </span>
        )}
      </div>

      {/* Nav links or Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        {!isAuthPage && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                style={{
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 600,
                  borderRadius: "100px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: currentPage === item.id ? COLORS.primary : "transparent",
                  color: currentPage === item.id ? "#fff" : COLORS.secondary,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s"
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {isLoggedIn ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px", borderLeft: `1px solid ${COLORS.outlineVariant}44`, paddingLeft: "24px" }}>
              <div
                onClick={() => navigate("profile")}
                style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
              >
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: COLORS.primaryContainer,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: COLORS.onPrimaryContainer,
                  fontSize: "12px",
                  fontWeight: 700,
                  border: `2px solid ${COLORS.primary}11`
                }}>
                  {initials}
                </div>
                <div className="hidden sm:block" style={{ textAlign: "left" }}>
                   <p style={{ fontSize: "12px", fontWeight: 700, color: COLORS.onSurface, lineHeight: 1 }}>{authUser?.fullName?.split(" ")[0] || authUser?.username}</p>
                   <p style={{ fontSize: "9px", color: COLORS.secondary, fontWeight: 500, textTransform: "uppercase", marginTop: "4px" }}>{role?.replace("_", " ")}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                style={{
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: COLORS.error,
                  backgroundColor: "transparent",
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  marginLeft: "8px"
                }}
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {currentPage !== "register" && (
                <button
                  onClick={() => navigate("register")}
                  style={{
                    padding: "10px 24px",
                    color: COLORS.primary,
                    background: "none",
                    fontSize: "13px",
                    fontWeight: 700,
                    borderRadius: "8px",
                    border: `1px solid ${COLORS.primary}44`,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <UserPlus size={16} />
                  Register
                </button>
              )}
              <button
                onClick={() => navigate("login")}
                style={{
                  padding: "10px 24px",
                  backgroundColor: COLORS.primary,
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 700,
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0, 11, 96, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <LogIn size={16} />
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}