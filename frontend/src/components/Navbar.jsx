import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const linksByRole = {
    patient: [
      { to: "/patient", label: "Dashboard" },
      { to: "/book", label: "Book" },
      { to: "/prescriptions", label: "Prescriptions" },
      { to: "/records", label: "Records" },
    ],
    doctor: [{ to: "/doctor", label: "Dashboard" }],
    admin: [{ to: "/admin", label: "Dashboard" }],
    pharmacist: [{ to: "/pharmacist", label: "Dashboard" }],
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return null;
  }

  return (
    <header className="topbar">
      <div className="brand-lockup">
        <button type="button" className="menu-toggle" onClick={() => setOpen((value) => !value)}>
          Menu
        </button>
        <div className="brand-badge">VC</div>
        <div>
          <div className="brand-title">VirtualCare Prime</div>
          <div className="brand-subtitle">Role-based command center</div>
        </div>
      </div>

      <nav className={`nav-cluster ${open ? "is-open" : ""}`}>
        {(linksByRole[role] || []).map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-pill${isActive ? " active" : ""}`}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="nav-actions">
        <div className="notification-chip">Live Data</div>
        <div className="user-chip">
          <span>{user.name}</span>
          <small>{role}</small>
        </div>
        <button onClick={handleLogout} className="btn btn-light">Logout</button>
      </div>
    </header>
  );
}

export default Navbar;
