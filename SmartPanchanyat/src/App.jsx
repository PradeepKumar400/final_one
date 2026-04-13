import { useState } from 'react'
import Navbar from './components/Navbar'
import HomePage from './components/HomePage'
import ComplaintsPage from './components/ComplaintsPage'
import ComplaintDetailPage from './components/ComplaintDetailPage'
import RaiseIssuePage from './components/RaiseIssuePage'
import TrackPage from './components/TrackPage'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import AdminDashboard from './components/AdminDashboard'
import WardDashboard from './components/WardDashboard'
import { getUser, isLoggedIn, logout } from './utils/api'
import './App.css'

function App() {
  const [currentPage, setCurrentPage]       = useState('home')
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [authUser, setAuthUser]             = useState(getUser)  // read from localStorage

  const navigate = (page, data = null) => {
    setCurrentPage(page)
    if (data) setSelectedComplaint(data)
    window.scrollTo(0, 0)
  }

  const handleLogin = (data) => {
    setAuthUser(data)
  }

  const handleLogout = () => {
    logout()
    setAuthUser(null)
    navigate('home')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage navigate={navigate} />
      case 'complaints':
        return <ComplaintsPage navigate={navigate} />
      case 'details':
        return <ComplaintDetailPage complaint={selectedComplaint} navigate={navigate} />
      case 'raise':
        return <RaiseIssuePage navigate={navigate} />
      case 'track':
        return <TrackPage navigate={navigate} />

      // ── Staff portals ──────────────────────────────────────────────────────
      case 'login':
        return <LoginPage navigate={navigate} onLogin={handleLogin} />
      case 'register':
        return <RegisterPage navigate={navigate} />
      case 'admin':
        return authUser?.role === 'ADMIN'
          ? <AdminDashboard navigate={navigate} />
          : <LoginPage navigate={navigate} onLogin={handleLogin} />
      case 'ward':
        return authUser?.role === 'WARD_MEMBER'
          ? <WardDashboard navigate={navigate} />
          : <LoginPage navigate={navigate} onLogin={handleLogin} />

      // ── Placeholder pages ──────────────────────────────────────────────────
      case 'funds':
        return (
          <div style={{ padding: "80px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>💰</div>
            <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#111827" }}>Funds Tracking</h2>
            <p style={{ color: "#6b7280" }}>Transparency in budget allocation coming soon.</p>
          </div>
        )
      case 'map':
        return (
          <div style={{ padding: "80px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>🗺️</div>
            <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#111827" }}>Geospatial Overview</h2>
            <p style={{ color: "#6b7280" }}>Interactive ward map coming soon.</p>
          </div>
        )
      default:
        return <HomePage navigate={navigate} />
    }
  }

  // Login page has its own full-screen layout — no navbar/footer
  if (currentPage === 'login') {
    return <LoginPage navigate={navigate} onLogin={handleLogin} />
  }

  return (
    <div className="app-container">
      <Navbar
        currentPage={currentPage}
        navigate={navigate}
        authUser={authUser}
        onLogout={handleLogout}
      />
      <main className="main-content">
        {renderPage()}
      </main>
      <footer style={{
        padding: "32px 24px",
        textAlign: "center",
        borderTop: "1px solid #e5e7eb",
        color: "#9ca3af",
        fontSize: "14px"
      }}>
        © 2026 SmartPanchayat — Citizen Complaint Management System
      </footer>
    </div>
  )
}

export default App
