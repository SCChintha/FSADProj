import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div>
        <Link to="/" className="nav-link" style={{ marginRight: 24 }}>
          Virtual Consultation
        </Link>

        <Link to="/patient" className="nav-link">
          Patient
        </Link>
        <Link to="/doctor" className="nav-link">
          Doctor
        </Link>
        <Link to="/admin" className="nav-link">
          Admin
        </Link>
        <Link to="/pharmacist" className="nav-link">
          Pharmacist
        </Link>
        <Link to="/book" className="nav-link">
          Book
        </Link>
        <Link to="/prescriptions" className="nav-link">
          Prescriptions
        </Link>
        <Link to="/records" className="nav-link">
          Records
        </Link>
      </div>

      <div>
        <Link to="/" className="nav-link" style={{ marginRight: 0 }}>
          Login
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;