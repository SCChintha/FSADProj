import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { getUsers, saveUsers } from "../mockData";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Password validation: min 8 length, uppercase, lowercase, number, special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      alert("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.");
      return;
    }

    const existingUsers = getUsers() || [];
    const userExists = existingUsers.find((u) => u.email === email);

    if (userExists) {
      alert("User with this email already exists!");
      return;
    }

    // Generate a pseudo user_id to integrate with mock data if necessary
    const newUserId = Date.now();
    const newUser = {
      user_id: newUserId,
      name,
      email,
      password,
      role,
      status: "active",
      created_at: new Date().toISOString().split("T")[0]
    };
    existingUsers.push(newUser);
    saveUsers(existingUsers);

    // Log in with the newly created user object
    login(newUser);

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
    <div className="card" style={{ maxWidth: 460, margin: "40px auto" }}>
      <h2 style={{ marginBottom: 16 }}>Sign up</h2>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Create an account and choose your role to continue.
      </p>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input
            className="input"
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Email</label>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password</label>
          <input
            className="input"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
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

        <button
          type="submit"
          className="btn"
          style={{ width: "100%", marginTop: 10, marginBottom: 10 }}
        >
          Sign up
        </button>
      </form>

      <div style={{ fontSize: 13, color: "#555" }}>
        Already have an account? <Link to="/">Login</Link>
      </div>
    </div>
  );
}

export default Signup;
