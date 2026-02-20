import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [role, setRole] = useState("patient");
  const navigate = useNavigate();
  const { login } = useAuth();

  const roleDescriptions = {
    patient:
      "Book virtual appointments, view your medical records and lab reports, and join online consultations.",
    doctor:
      "Conduct virtual consultations, review patient history and lab reports, and issue secure e‑prescriptions.",
    admin:
      "Manage platform settings, oversee all user accounts, and monitor system security and compliance.",
    pharmacist:
      "Review e‑prescriptions, verify medication orders, and provide patients with accurate medication guidance.",
  };

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
    <div className="card" style={{ maxWidth: 480, margin: "40px auto" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 600,
            marginRight: 10,
          }}
        >
          VC
        </div>
        <div>
          <h2 style={{ margin: 0 }}>VirtualCare</h2>
          <p style={{ margin: 0, fontSize: 13, color: "#4b5563" }}>
            Secure Virtual Healthcare at Your Fingertips
          </p>
        </div>
      </div>

      <p style={{ color: "#666", marginBottom: 16, fontSize: 14 }}>
        Sign in to access virtual consultations, e‑prescriptions, and your
        medical records.
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
          <div style={{ position: "relative" }}>
            <input
              className="input"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingRight: 70 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                fontSize: 12,
                color: "#2563eb",
                cursor: "pointer",
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 6,
            marginBottom: 4,
            fontSize: 13,
          }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>
          <button
            type="button"
            style={{
              border: "none",
              background: "transparent",
              color: "#2563eb",
              cursor: "pointer",
              padding: 0,
            }}
            onClick={() => alert("Forgot password flow can be implemented here.")}
          >
            Forgot Password?
          </button>
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Login as</label>
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
          <p style={{ fontSize: 12, color: "#555", marginTop: 6 }}>
            {roleDescriptions[role]}
          </p>
        </div>

        <button type="submit" className="btn" style={{ width: "100%", marginTop: 10 }}>
          Continue
        </button>
        <div style={{ fontSize: 13, color: "#555", marginTop: 8 }}>
          New here? <Link to="/signup">Create an account</Link>
        </div>

        <div
          style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: "1px solid #e5e7eb",
            fontSize: 12,
            color: "#4b5563",
          }}
        >
          <div>🔒 Your login is protected with encrypted communication.</div>
          <div>🛡️ Designed for secure, HIPAA‑style healthcare data handling.</div>
        </div>
      </form>
    </div>
  );
}

export default Login;
