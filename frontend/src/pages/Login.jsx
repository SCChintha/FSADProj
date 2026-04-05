import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { apiRequest } from "../apiClient";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [role, setRole] = useState("patient");
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const roleDescriptions = {
    patient:
      "Book appointments, view medical records, and track prescriptions.",
    doctor:
      "Manage consultations, review patient history, and issue prescriptions.",
    admin:
      "Monitor users, oversee operations, and manage the platform.",
    pharmacist:
      "Review prescriptions, track inventory, and dispense medications.",
  };

  useEffect(() => {
    const selectedRole = location.state?.role;
    if (selectedRole) {
      setRole(selectedRole);
    }
  }, [location.state]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });
      const normalizedRole = data.role?.toLowerCase();

      if (normalizedRole !== role) {
        alert("Your account role does not match the selected role.");
        return;
      }

      const userData = {
        user_id: data.userId,
        name: data.name,
        email: data.email,
        role: normalizedRole,
        token: data.token,
        rememberMe,
      };

      login(userData);
      navigate(`/${normalizedRole === "patient" ? "patient" : normalizedRole}`);
    } catch (error) {
      console.error(error);
      alert(error.message || "Unable to reach the backend. Please make sure the API server and database are running.");
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
        Sign in to access appointments, prescriptions, and records.
      </p>

      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          className="input"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label>Password</label>
        <div style={{ position: "relative" }}>
          <input
            className="input"
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={{ paddingRight: 70 }}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
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
              onChange={(event) => setRememberMe(event.target.checked)}
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
            onClick={() => alert("Forgot password flow is not implemented yet.")}
          >
            Forgot Password?
          </button>
        </div>

        <label>Login as</label>
        <select
          className="input"
          value={role}
          onChange={(event) => setRole(event.target.value)}
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="admin">Admin</option>
          <option value="pharmacist">Pharmacist</option>
        </select>
        <p style={{ fontSize: 12, color: "#555", marginTop: 6 }}>
          {roleDescriptions[role]}
        </p>

        <button type="submit" className="btn" style={{ width: "100%", marginTop: 10 }}>
          Continue
        </button>
        <div style={{ fontSize: 13, color: "#555", marginTop: 8 }}>
          New here? <Link to="/signup">Create an account</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
