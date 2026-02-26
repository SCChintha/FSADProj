import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return (
      <nav className="navbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span className="nav-link" style={{ marginRight: 24, fontSize: 18, color: "white", background: "transparent", padding: 0, boxShadow: "none" }}>
            Virtual Consultation
          </span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/" className="btn" style={{ background: "white", color: "#1976d2", textDecoration: "none", fontWeight: "bold" }}>Login</Link>
          <Link to="/signup" className="btn" style={{ background: "transparent", border: "1px solid white", color: "white", textDecoration: "none", fontWeight: "bold" }}>Signup</Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 24px" }}>
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <span style={{ marginRight: 24, fontSize: 18, color: "white", fontWeight: "bold" }}>
          Virtual Consultation
        </span>

        {role === "patient" && (
          <>
            <Link to="/patient" className="nav-link" style={navStyle}>Dashboard</Link>
            <Link to="/book" className="nav-link" style={navStyle}>Book Appointment</Link>
            <Link to="/prescriptions" className="nav-link" style={navStyle}>Prescriptions</Link>
            <Link to="/records" className="nav-link" style={navStyle}>Records</Link>
          </>
        )}
        {role === "doctor" && (
          <Link to="/doctor" className="nav-link" style={navStyle}>Dashboard</Link>
        )}
        {role === "admin" && (
          <Link to="/admin" className="nav-link" style={navStyle}>Dashboard</Link>
        )}
        {role === "pharmacist" && (
          <Link to="/pharmacist" className="nav-link" style={navStyle}>Dashboard</Link>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ color: "white", marginRight: 15, fontSize: "14px", fontWeight: "bold", textTransform: "capitalize" }}>
          {user.name} ({role})
        </span>
        <button onClick={handleLogout} className="btn" style={{ padding: "6px 12px", background: "white", color: "#1976d2", fontWeight: "bold" }}>
          Logout
        </button>
      </div>
    </nav>
  );
}

const navStyle = {
  background: "transparent",
  padding: "8px 12px",
  boxShadow: "none",
  color: "rgba(255, 255, 255, 0.8)",
  borderRadius: "4px",
  transition: "all 0.2s"
};

export default Navbar;