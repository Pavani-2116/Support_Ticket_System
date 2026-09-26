import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">ST</span>
          <div>
            <strong>Support Desk</strong>
            <p>Ticket management portal</p>
          </div>
        </div>
        <nav className="nav">
          {user?.role === "customer" && (
            <>
              <NavLink to="/dashboard">My tickets</NavLink>
              <NavLink to="/tickets/new">New ticket</NavLink>
            </>
          )}
          {user?.role === "agent" && <NavLink to="/agent">Queue</NavLink>}
        </nav>
        <div className="session">
          <div>
            <strong>{user?.name}</strong>
            <span className="role-chip">{user?.role}</span>
          </div>
          <button type="button" className="ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
