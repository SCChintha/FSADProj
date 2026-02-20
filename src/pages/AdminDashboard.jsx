import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { users, appointments, systemActivity, securityStatus } from "../mockData";
import { useAuth } from "../AuthContext";

function AdminDashboard() {
  const totalDoctors = users.filter((u) => u.role === "doctor").length;
  const totalPatients = users.filter((u) => u.role === "patient").length;
  const totalPharmacists = users.filter((u) => u.role === "pharmacist").length;

  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const { logout } = useAuth();

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  });

  const handleQuickAction = (label) => {
    window.alert("Mock admin action: " + label);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="card">
      <div className="dashboard-header">
        <div>
          <div className="dashboard-title">Admin Dashboard</div>
          <p style={{ color: "#666", fontSize: 14 }}>
            Monitor platform health, manage users and review system activity.
          </p>
        </div>
        <div>
          <button
            className="btn"
            style={{ padding: "6px 10px", fontSize: 12 }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Platform stats cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Users</div>
          <div className="kpi-value">{users.length}</div>
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
          <div className="kpi-value">{appointments.length}</div>
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
                    <td>
                      <button
                        className="btn"
                        style={{ padding: "6px 10px", fontSize: 12 }}
                        onClick={() => window.alert("Mock: view profile for " + u.name)}
                      >
                        View / Disable
                      </button>
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
    </div>
  );
}

export default AdminDashboard;