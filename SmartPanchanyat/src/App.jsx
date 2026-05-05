import { useState } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import ComplaintsPage from "./components/ComplaintsPage";
import ComplaintDetailPage from "./components/ComplaintDetailPage";
import RaiseIssuePage from "./components/RaiseIssuePage";
import TrackPage from "./components/TrackPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import AdminDashboard from "./components/AdminDashboard";
import WardDashboard from "./components/WardDashboard";
import PresidentDashboard from "./components/PresidentDashboard";
import ProfilePage from "./components/ProfilePage";
import WalletSetupPage from "./components/blockchain/WalletSetupPage";
import PublicFeed from "./components/PublicFeed";
import { getUser, logout } from "./utils/api";
import { CircleDollarSign, Map as MapIcon } from "lucide-react";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [authUser, setAuthUser] = useState(getUser);

  const navigate = (page, data = null) => {
    setCurrentPage(page);
    if (data) setSelectedComplaint(data);
    window.scrollTo(0, 0);
  };

  useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("token")) {
      setCurrentPage("setup-wallet");
    }
  });

  const handleLogin = (data) => {
    setAuthUser(data);
  };

  const handleLogout = () => {
    logout();
    setAuthUser(null);
    navigate("home");
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage navigate={navigate} />;
      case "complaints":
        return <ComplaintsPage navigate={navigate} />;
      case "details":
        return (
          <ComplaintDetailPage
            key={selectedComplaint?.id || "empty"}
            complaint={selectedComplaint}
            navigate={navigate}
          />
        );
      case "raise":
        return <RaiseIssuePage navigate={navigate} />;
      case "track":
        return <TrackPage navigate={navigate} />;

      case "login":
        return <LoginPage navigate={navigate} onLogin={handleLogin} />;
      case "register":
        return <RegisterPage navigate={navigate} />;
      case "admin":
        return authUser?.role === "ADMIN" ? (
          <AdminDashboard navigate={navigate} />
        ) : (
          <LoginPage navigate={navigate} onLogin={handleLogin} />
        );
      case "ward":
        return authUser?.role === "WARD_MEMBER" ? (
          <WardDashboard navigate={navigate} />
        ) : (
          <LoginPage navigate={navigate} onLogin={handleLogin} />
        );
      case "president":
        return authUser?.role === "PRESIDENT" ? (
          <PresidentDashboard navigate={navigate} />
        ) : (
          <LoginPage navigate={navigate} onLogin={handleLogin} />
        );

      case "setup-wallet":
        return <WalletSetupPage />;
      case "public-ledger":
        return <PublicFeed />;
      case "profile":
        return <ProfilePage user={authUser} navigate={navigate} />;
      case "map":
        return (
          <div
            style={{
              padding: "120px 24px",
              textAlign: "center",
              background: "#f8fafc",
              minHeight: "60vh",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  background: "#dbeafe",
                  color: "#1e40af",
                  borderRadius: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MapIcon size={40} />
              </div>
            </div>
            <h2
              style={{
                fontSize: "32px",
                fontWeight: 800,
                color: "#1e1b4b",
                marginBottom: "12px",
              }}
            >
              Geospatial Overview
            </h2>
            <p
              style={{
                color: "#64748b",
                maxWidth: "400px",
                margin: "0 auto",
                lineHeight: 1.6,
              }}
            >
              Spatial data visualization for ward-level issues and service
              coverage maps is in development. Coming soon.
            </p>
          </div>
        );
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  if (currentPage === "login") {
    return <LoginPage navigate={navigate} onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <Navbar
        currentPage={currentPage}
        navigate={navigate}
        authUser={authUser}
        onLogout={handleLogout}
      />
      <main className="main-content">{renderPage()}</main>
    </div>
  );
}

export default App;
