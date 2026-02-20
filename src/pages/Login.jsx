import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple front-end only "login" that just stores the role
    login(role);

    if (role === "admin") {
      navigate("/admin");
    } else if (role === "doctor") {
      navigate("/doctor");
    } else if (role === "pharmacist") {
      navigate("/pharmacist");
    } else {
      navigate("/patient");
    }
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2 style={{ marginBottom: 16 }}>Login</h2>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Select your role to enter the corresponding dashboard.
      </p>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Password</label>
          <input
            className="input"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label>Role</label>
          <select
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
            <option value="pharmacist">Pharmacist</option>
          </select>
        </div>

        <button type="submit" className="btn" style={{ width: "100%", marginTop: 10 }}>
          Continue
        </button>
      </form>
      <div style={{ fontSize: 13, color: "#555", marginTop: 8 }}>
        New here? <Link to="/signup">Create an account</Link>
      </div>
    </div>
  );
}

export default Login;
