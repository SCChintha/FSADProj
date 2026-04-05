import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { apiRequest } from "../apiClient";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      alert(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    try {
      const data = await apiRequest("/api/auth/signup", {
        method: "POST",
        body: { name, email, password, role },
      });
      const normalizedRole = data.role?.toLowerCase();
      const userData = {
        user_id: data.userId,
        name: data.name,
        email: data.email,
        role: normalizedRole,
        token: data.token,
      };

      login(userData);
      navigate(`/${normalizedRole === "patient" ? "patient" : normalizedRole}`);
    } catch (error) {
      console.error(error);
      alert(error.message || "Unable to reach the backend. Please make sure the API server and database are running.");
    }
  };

  return (
    <div className="card" style={{ maxWidth: 460, margin: "40px auto" }}>
      <h2 style={{ marginBottom: 16 }}>Sign Up</h2>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Create an account and choose your role to continue.
      </p>

      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input
          className="input"
          type="text"
          placeholder="Your full name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />

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
        <input
          className="input"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <label>Role</label>
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

        <button
          type="submit"
          className="btn"
          style={{ width: "100%", marginTop: 10, marginBottom: 10 }}
        >
          Sign Up
        </button>
      </form>

      <div style={{ fontSize: 13, color: "#555" }}>
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
}

export default Signup;
