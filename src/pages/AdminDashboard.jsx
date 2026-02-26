import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers, saveUsers, getAppointments, systemActivity, securityStatus } from "../mockData";
import { useAuth } from "../AuthContext";

function AdminDashboard() {
  const [usersList, setUsersList] = useState(getUsers());
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "doctor", password: "" });

  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const adminName = user?.name || "Admin";

  const totalDoctors = usersList.filter((u) => u.role === "doctor").length;
  const totalPatients = usersList.filter((u) => u.role === "patient").length;
  const totalPharmacists = usersList.filter((u) => u.role === "pharmacist").length;

  const filteredUsers = usersList.filter((u) => {
    const term = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  });

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    const newUserObj = {
      user_id: Date.now(),
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role,
      status: "active",
      created_at: new Date().toISOString().split("T")[0]
    };
    const updatedUsers = [...usersList, newUserObj];
    setUsersList(updatedUsers);
    saveUsers(updatedUsers);
    setShowAddModal(false);
    setNewUser({ name: "", email: "", role: "doctor", password: "" });
  };

  const toggleUserStatus = (userId) => {
    const updatedUsers = usersList.map((u) =>
      u.user_id === userId ? { ...u, status: u.status === "active" ? "disabled" : "active" } : u
    );
    setUsersList(updatedUsers);
    saveUsers(updatedUsers);
  };

  const deleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This cannot be undone.")) {
      const updatedUsers = usersList.filter((u) => u.user_id !== userId);
      setUsersList(updatedUsers);
      saveUsers(updatedUsers);
    }
  };

  const handleQuickAction = (label) => {
    if (label === "Add User") {
      setShowAddModal(true);
    } else {
      window.alert(label + " feature is coming soon!");
    }
  };

  return (
    <div className="card">
      <div className="dashboard-header">
        <div>
          <div className="dashboard-title">Admin Dashboard</div>
          <p style={{ color: "#666", fontSize: 14 }}>
            Welcome, {adminName}. Monitor platform health, manage users and review system activity.
          </p>
        </div>
      </div>

      {/* Platform stats cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Users</div>
          <div className="kpi-value">{usersList.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Doctors</div>
          <div className="kpi-value">{totalDoctors}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Patients</div>
          <div className="kpi-value">{totalPatients}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Appointments</div>
          <div className="kpi-value">{getAppointments().length}</div>
        </div>
      </div>

      {/* Quick admin actions */}
      <div className="quick-actions">
        <button className="btn" onClick={() => handleQuickAction("Add User")}>
          Add User
        </button>
        <button className="btn" onClick={() => handleQuickAction("Verify Doctor")}>
          Verify Doctor
        </button>
        <button className="btn" onClick={() => handleQuickAction("View Reports")}>
          View Reports
        </button>
        <button className="btn" onClick={() => handleQuickAction("System Settings")}>
          System Settings
        </button>
      </div>

      <div className="dashboard-layout">
        <div>
          <div className="section-card">
            <div className="section-title">User Management</div>
            <div className="table-search">
              <input
                className="input"
                placeholder="Search by name, role, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.user_id}>
                    <td>{u.name}</td>
                    <td style={{ textTransform: "capitalize" }}>{u.role}</td>
                    <td>
                      <span
                        className={
                          "pill " +
                          (u.status === "active" ? "pill-success" : "pill-warning")
                        }
                        style={{ textTransform: "capitalize" }}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "#666" }}>
                      {u.last_login || "Never"}
                    </td>
                    <td>
                      <button
                        className="btn"
                        style={{ padding: "6px 10px", fontSize: 12, marginRight: "5px" }}
                        onClick={() => toggleUserStatus(u.user_id)}
                      >
                        {u.status === "active" ? "Disable" : "Enable"}
                      </button>
                      {u.user_id !== user?.user_id && (
                        <button
                          className="btn"
                          style={{ padding: "6px 10px", fontSize: 12, background: "#d32f2f" }}
                          onClick={() => deleteUser(u.user_id)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="section-card">
            <div className="section-title">System Activity</div>
            {systemActivity.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: "#f5f7fb",
                  marginBottom: 8,
                  fontSize: 13
                }}
              >
                <div>{log.message}</div>
                <div style={{ fontSize: 11, color: "#999" }}>{log.time}</div>
              </div>
            ))}
          </div>

          <div className="section-card">
            <div className="section-title">Security Status</div>
            <div style={{ fontSize: 13 }}>
              <div style={{ marginBottom: 6 }}>
                <strong>Last backup:</strong> {securityStatus.lastBackup}
              </div>
              <div style={{ marginBottom: 6 }}>
                <strong>Active sessions:</strong> {securityStatus.activeSessions}
              </div>
              <div>
                <strong>System health:</strong>{" "}
                <span className="pill pill-success">{securityStatus.systemHealth}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="section-title" style={{ marginBottom: 16 }}>
              Add New User
            </div>
            <form onSubmit={handleAddUserSubmit} style={{ fontSize: 13 }}>
              <input
                className="input"
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
              <input
                className="input"
                type="email"
                placeholder="Email Address"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
              <input
                className="input"
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
              <select
                className="input"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="doctor">Doctor</option>
                <option value="patient">Patient</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="admin">Admin</option>
              </select>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button className="btn" type="submit">
                  Save User
                </button>
                <button
                  className="btn"
                  type="button"
                  style={{ background: "#ccc", color: "#333", border: "none" }}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
