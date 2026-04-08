import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { adminApi, titleCase } from "../adminApi";

const tabs = [
  "Overview",
  "Users",
  "Doctors",
  "Pharmacists",
  "Patients",
  "Appointments",
  "Complaints",
  "Prescriptions",
  "Analytics",
  "Logs",
];

const defaultUserFilters = {
  search: "",
  role: "",
  status: "",
  approvalState: "",
  page: 0,
  size: 20,
};

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [usersPage, setUsersPage] = useState({ content: [], totalPages: 1, totalElements: 0 });
  const [userFilters, setUserFilters] = useState(defaultUserFilters);
  const [selectedUser, setSelectedUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescriptionSummary, setPrescriptionSummary] = useState(null);
  const [logsPage, setLogsPage] = useState({ content: [], totalPages: 1, totalElements: 0 });
  const [complaintDraft, setComplaintDraft] = useState({
    targetUserId: "",
    category: "Support",
    subject: "",
    description: "",
  });

  const roleForTab = useMemo(() => {
    if (activeTab === "Doctors") return "DOCTOR";
    if (activeTab === "Pharmacists") return "PHARMACIST";
    if (activeTab === "Patients") return "PATIENT";
    return "";
  }, [activeTab]);

  const loadStats = async () => {
    const data = await adminApi.getStats();
    setStats(data);
  };

  const loadUsers = async (overrides = {}) => {
    const nextFilters = { ...userFilters, ...overrides };
    if (roleForTab) {
      nextFilters.role = roleForTab;
    }
    const data = await adminApi.getUsers(nextFilters);
    setUsersPage(data);
    setUserFilters(nextFilters);
  };

  const loadAppointments = async () => {
    setAppointments(await adminApi.getAppointments({}));
  };

  const loadComplaints = async () => {
    setComplaints(await adminApi.getComplaints({}));
  };

  const loadPrescriptions = async () => {
    const [items, summary] = await Promise.all([
      adminApi.getPrescriptions({}),
      adminApi.getPrescriptionSummary(),
    ]);
    setPrescriptions(items);
    setPrescriptionSummary(summary);
  };

  const loadLogs = async (page = 0, severity = "") => {
    const data = await adminApi.getLogs({ page, size: 20, severity });
    setLogsPage(data);
  };

  const guardedLoad = async (runner) => {
    setLoading(true);
    setError("");
    try {
      await runner();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    guardedLoad(async () => {
      if (activeTab === "Overview" || activeTab === "Analytics") {
        await loadStats();
      }
      if (activeTab === "Users") {
        await loadUsers({ page: 0, role: "", approvalState: "" });
      }
      if (["Doctors", "Pharmacists", "Patients"].includes(activeTab)) {
        await loadUsers({ page: 0 });
      }
      if (activeTab === "Appointments") {
        await loadAppointments();
      }
      if (activeTab === "Complaints") {
        await loadComplaints();
      }
      if (activeTab === "Prescriptions") {
        await loadPrescriptions();
      }
      if (activeTab === "Logs") {
        await loadLogs();
      }
    });
  }, [activeTab, roleForTab]);

  const handleViewUser = async (userId) => {
    try {
      const data = await adminApi.getUserDetail(userId);
      setSelectedUser(data);
    } catch (err) {
      toast.error(err.message || "Failed to load user detail.");
    }
  };

  const handleSaveUser = async () => {
    if (!selectedUser?.user) return;
    try {
      const payload = {
        name: selectedUser.user.name,
        phone: selectedUser.user.phone,
        address: selectedUser.user.address,
      };
      await adminApi.updateUser(selectedUser.user.id, payload);
      toast.success("User updated.");
      await loadUsers();
      await handleViewUser(selectedUser.user.id);
    } catch (err) {
      toast.error(err.message || "Failed to update user.");
    }
  };

  const handleStatusChange = async (user, status) => {
    try {
      await adminApi.updateUserStatus(user.id, { status, reason: `Changed from admin dashboard to ${status}` });
      toast.success(`User ${titleCase(status)}.`);
      await Promise.all([loadUsers(), loadStats()]);
    } catch (err) {
      toast.error(err.message || "Failed to update status.");
    }
  };

  const handleApproval = async (user, approved) => {
    const verificationNotes = approved ? "Verified by admin dashboard" : "";
    const reason = approved ? "" : window.prompt("Reason for rejection") || "Rejected by admin";
    if (!approved && !reason) return;
    try {
      const fn = user.role === "PHARMACIST" ? adminApi.approvePharmacist : adminApi.approveDoctor;
      await fn(user.id, { approved, reason, verificationNotes });
      toast.success(approved ? "Account approved." : "Account rejected.");
      await Promise.all([loadUsers(), loadStats()]);
    } catch (err) {
      toast.error(err.message || "Failed to update approval.");
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      await adminApi.resetPassword(userId);
      toast.success("Temporary password sent.");
    } catch (err) {
      toast.error(err.message || "Failed to reset password.");
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.email}? This cannot be undone.`)) return;
    try {
      await adminApi.deleteUser(user.id);
      toast.success("User deleted.");
      setSelectedUser(null);
      await Promise.all([loadUsers(), loadStats()]);
    } catch (err) {
      toast.error(err.message || "Failed to delete user.");
    }
  };

  const handleReschedule = async (appointment) => {
    const date = window.prompt("New date (YYYY-MM-DD)", appointment.date);
    const time = window.prompt("New time (HH:MM)", appointment.time?.slice?.(0, 5) || appointment.time);
    if (!date || !time) return;
    try {
      await adminApi.rescheduleAppointment(appointment.id, {
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        date,
        time: `${time}:00`,
        mode: appointment.mode,
        reason: appointment.reason,
      });
      toast.success("Appointment rescheduled.");
      await loadAppointments();
    } catch (err) {
      toast.error(err.message || "Failed to reschedule appointment.");
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await adminApi.cancelAppointment(appointmentId);
      toast.success("Appointment cancelled.");
      await loadAppointments();
    } catch (err) {
      toast.error(err.message || "Failed to cancel appointment.");
    }
  };

  const handleComplaintSave = async (complaint) => {
    const adminResponse = window.prompt("Admin response", complaint.adminResponse || "");
    if (adminResponse === null) return;
    const status = window.prompt("Status (OPEN, IN_PROGRESS, RESOLVED, REJECTED)", complaint.status || "IN_PROGRESS");
    if (!status) return;
    try {
      await adminApi.updateComplaint(complaint.id, { adminResponse, status });
      toast.success("Complaint updated.");
      await loadComplaints();
    } catch (err) {
      toast.error(err.message || "Failed to update complaint.");
    }
  };

  const handleCreateComplaint = async (event) => {
    event.preventDefault();
    try {
      await adminApi.createComplaint({
        targetUserId: complaintDraft.targetUserId ? Number(complaintDraft.targetUserId) : null,
        category: complaintDraft.category,
        subject: complaintDraft.subject,
        description: complaintDraft.description,
      });
      toast.success("Complaint created.");
      setComplaintDraft({ targetUserId: "", category: "Support", subject: "", description: "" });
      await loadComplaints();
    } catch (err) {
      toast.error(err.message || "Failed to create complaint.");
    }
  };

  const renderOverview = () => {
    const summary = stats?.summary || {};
    const activitySeries = stats?.activitySeries || [];
    return (
      <div className="stack-list">
        <MetricGrid items={[
          { label: "Total Users", value: summary.totalUsers || 0, tone: "#1d4ed8" },
          { label: "Pending Approvals", value: summary.pendingApprovals || 0, tone: "#c2410c" },
          { label: "Appointments", value: summary.appointments || 0, tone: "#047857" },
          { label: "Complaints", value: summary.complaints || 0, tone: "#991b1b" },
        ]} />
        <div className="dashboard-grid">
          <section className="card">
            <div className="section-header"><h3>Approval Queue</h3></div>
            <div className="scheduler-row"><span>Doctors pending</span><strong>{stats?.approvalQueue?.doctorsPending || 0}</strong></div>
            <div className="scheduler-row"><span>Pharmacists pending</span><strong>{stats?.approvalQueue?.pharmacistsPending || 0}</strong></div>
          </section>
          <section className="card">
            <div className="section-header"><h3>Recent Complaints</h3></div>
            {(stats?.recentComplaints || []).map((item) => (
              <div key={item.id} className="feed-item">
                <strong>{item.subject}</strong>
                <span>{titleCase(item.status)} | {item.category}</span>
              </div>
            ))}
          </section>
        </div>
        <section className="card">
          <div className="section-header"><h3>7-day activity</h3></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 12 }}>
            {activitySeries.map((point) => (
              <div key={point.day} style={{ background: "#f8fafc", borderRadius: 12, padding: 12 }}>
                <div className="muted-text text-sm">{point.day.slice(5)}</div>
                <Bar value={point.users} label="Users" color="#1d4ed8" />
                <Bar value={point.appointments} label="Appointments" color="#047857" />
                <Bar value={point.complaints} label="Complaints" color="#b91c1c" />
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  };

  const renderUserSection = (sectionTitle) => (
    <div className="dashboard-grid" style={{ alignItems: "start" }}>
      <section className="card">
        <div className="section-header" style={{ flexWrap: "wrap", gap: 12 }}>
          <h2>{sectionTitle}</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input className="input compact-input" placeholder="Search users" value={userFilters.search} onChange={(e) => setUserFilters((prev) => ({ ...prev, search: e.target.value }))} />
            {!roleForTab && (
              <select className="input compact-input" value={userFilters.role} onChange={(e) => setUserFilters((prev) => ({ ...prev, role: e.target.value }))}>
                <option value="">All roles</option>
                <option value="ADMIN">Admin</option>
                <option value="DOCTOR">Doctor</option>
                <option value="PHARMACIST">Pharmacist</option>
                <option value="PATIENT">Patient</option>
              </select>
            )}
            <select className="input compact-input" value={userFilters.status} onChange={(e) => setUserFilters((prev) => ({ ...prev, status: e.target.value }))}>
              <option value="">All status</option>
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
            </select>
            {(activeTab === "Doctors" || activeTab === "Pharmacists") && (
              <select className="input compact-input" value={userFilters.approvalState} onChange={(e) => setUserFilters((prev) => ({ ...prev, approvalState: e.target.value }))}>
                <option value="">All approval</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
              </select>
            )}
            <button className="btn small-btn" onClick={() => loadUsers({ page: 0 })}>Apply</button>
          </div>
        </div>
        <UserTable
          users={usersPage.content || []}
          onView={handleViewUser}
          onStatus={handleStatusChange}
          onApprove={handleApproval}
          onResetPassword={handleResetPassword}
          onDelete={handleDeleteUser}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <span className="muted-text text-sm">Total: {usersPage.totalElements || 0}</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn small-btn" disabled={(userFilters.page || 0) === 0} onClick={() => loadUsers({ page: Math.max((userFilters.page || 0) - 1, 0) })}>Previous</button>
            <button className="btn small-btn" disabled={(userFilters.page || 0) >= Math.max((usersPage.totalPages || 1) - 1, 0)} onClick={() => loadUsers({ page: (userFilters.page || 0) + 1 })}>Next</button>
          </div>
        </div>
      </section>
      <section className="card">
        <div className="section-header"><h2>User Detail</h2></div>
        {!selectedUser ? (
          <div className="empty-state">Select a user to view and edit their admin detail.</div>
        ) : (
          <div className="stack-list">
            <input className="input" value={selectedUser.user.name || ""} onChange={(e) => setSelectedUser((prev) => ({ ...prev, user: { ...prev.user, name: e.target.value } }))} />
            <input className="input" value={selectedUser.user.phone || ""} onChange={(e) => setSelectedUser((prev) => ({ ...prev, user: { ...prev.user, phone: e.target.value } }))} placeholder="Phone" />
            <textarea className="input" rows={3} value={selectedUser.user.address || ""} onChange={(e) => setSelectedUser((prev) => ({ ...prev, user: { ...prev.user, address: e.target.value } }))} placeholder="Address" />
            <div className="muted-text text-sm">Role: {titleCase(selectedUser.user.role)} | Status: {titleCase(selectedUser.user.status)}</div>
            <pre style={{ whiteSpace: "pre-wrap", background: "#f8fafc", padding: 12, borderRadius: 12, margin: 0 }}>
              {JSON.stringify(selectedUser.profile, null, 2)}
            </pre>
            <button className="btn" onClick={handleSaveUser}>Save User</button>
          </div>
        )}
      </section>
    </div>
  );

  return (
    <div className="container dashboard-page mt-16">
      <section className="card mb-24" style={{ background: "linear-gradient(135deg, #0f172a, #1d4ed8)", color: "white" }}>
        <p className="eyebrow" style={{ color: "#bfdbfe" }}>Admin Command Center</p>
        <h1 style={{ marginBottom: 8 }}>Platform governance, approvals, oversight, and audit controls in one place.</h1>
        <p style={{ color: "#dbeafe" }}>This dashboard is backed by the live admin APIs for users, appointments, complaints, prescriptions, analytics, security, logs, and settings.</p>
      </section>

      <div className="tab-row" style={{ marginBottom: 24, flexWrap: "wrap" }}>
        {tabs.map((tab) => (
          <button key={tab} className={`tab-chip ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {error && <div className="card mb-16" style={{ color: "#b91c1c" }}>{error}</div>}
      {loading && <div className="card mb-16">Loading {activeTab.toLowerCase()}...</div>}

      {activeTab === "Overview" && renderOverview()}
      {activeTab === "Users" && renderUserSection("User Management")}
      {activeTab === "Doctors" && renderUserSection("Doctor Verification")}
      {activeTab === "Pharmacists" && renderUserSection("Pharmacist Oversight")}
      {activeTab === "Patients" && renderUserSection("Patient Profiles")}

      {activeTab === "Appointments" && (
        <section className="card">
          <div className="section-header"><h2>Appointment Management</h2></div>
          <SimpleTable headers={["Date", "Doctor", "Patient", "Status", "Conflict", "Actions"]}>
            {appointments.map((item) => (
              <tr key={item.id}>
                <td>{item.date} {item.time?.slice?.(0, 5) || item.time}</td>
                <td>{item.doctorName}</td>
                <td>{item.patientName}</td>
                <td>{titleCase(item.status)}</td>
                <td>{item.hasConflict ? "Yes" : "No"}</td>
                <td style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="btn small-btn" onClick={() => handleReschedule(item)}>Reschedule</button>
                  <button className="btn small-btn danger-btn" onClick={() => handleCancelAppointment(item.id)}>Cancel</button>
                </td>
              </tr>
            ))}
          </SimpleTable>
        </section>
      )}

      {activeTab === "Complaints" && (
        <div className="dashboard-grid">
          <section className="card">
            <div className="section-header"><h2>Complaint Inbox</h2></div>
            <SimpleTable headers={["Subject", "Category", "Status", "User", "Response", "Actions"]}>
              {complaints.map((item) => (
                <tr key={item.id}>
                  <td>{item.subject}</td>
                  <td>{item.category}</td>
                  <td>{titleCase(item.status)}</td>
                  <td>{item.createdByUserName || item.targetUserName || "-"}</td>
                  <td>{item.adminResponse || "-"}</td>
                  <td><button className="btn small-btn" onClick={() => handleComplaintSave(item)}>Respond</button></td>
                </tr>
              ))}
            </SimpleTable>
          </section>
          <section className="card">
            <div className="section-header"><h2>Create Complaint</h2></div>
            <form onSubmit={handleCreateComplaint}>
              <input className="input" placeholder="Target user id" value={complaintDraft.targetUserId} onChange={(e) => setComplaintDraft((prev) => ({ ...prev, targetUserId: e.target.value }))} />
              <input className="input" placeholder="Category" value={complaintDraft.category} onChange={(e) => setComplaintDraft((prev) => ({ ...prev, category: e.target.value }))} />
              <input className="input" placeholder="Subject" value={complaintDraft.subject} onChange={(e) => setComplaintDraft((prev) => ({ ...prev, subject: e.target.value }))} required />
              <textarea className="input" rows={5} placeholder="Description" value={complaintDraft.description} onChange={(e) => setComplaintDraft((prev) => ({ ...prev, description: e.target.value }))} required />
              <button className="btn" type="submit">Create Complaint</button>
            </form>
          </section>
        </div>
      )}

      {activeTab === "Prescriptions" && (
        <div className="stack-list">
          <MetricGrid items={[
            { label: "Total", value: prescriptionSummary?.total || 0, tone: "#1d4ed8" },
            { label: "Issued", value: prescriptionSummary?.issued || 0, tone: "#047857" },
            { label: "Dispensed", value: prescriptionSummary?.dispensed || 0, tone: "#7c3aed" },
            { label: "Suspicious", value: prescriptionSummary?.suspicious || 0, tone: "#b91c1c" },
          ]} />
          <section className="card">
            <div className="section-header"><h2>Prescription Monitoring</h2></div>
            <SimpleTable headers={["Date", "Medicine", "Doctor", "Patient", "Status", "Flags"]}>
              {prescriptions.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td>{item.medicineName}</td>
                  <td>{item.doctorName}</td>
                  <td>{item.patientName}</td>
                  <td>{titleCase(item.status)}</td>
                  <td>{item.suspicious ? "Suspicious" : item.inventoryLow ? "Low stock" : "-"}</td>
                </tr>
              ))}
            </SimpleTable>
          </section>
        </div>
      )}

      {activeTab === "Analytics" && (
        <div className="dashboard-grid">
          <BreakdownCard title="Users by role" data={stats?.userBreakdown || {}} />
          <BreakdownCard title="Appointments by status" data={stats?.appointmentBreakdown || {}} />
          <BreakdownCard title="Prescriptions by status" data={stats?.prescriptionBreakdown || {}} />
          <BreakdownCard title="Complaints by status" data={stats?.complaintBreakdown || {}} />
        </div>
      )}

      {activeTab === "Logs" && (
        <section className="card">
          <div className="section-header"><h2>Audit Logs</h2></div>
          <SimpleTable headers={["Time", "Actor", "Action", "Category", "Severity", "Details"]}>
            {(logsPage.content || []).map((log) => (
              <tr key={log.id}>
                <td>{log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}</td>
                <td>{log.actorName}</td>
                <td>{titleCase(log.action)}</td>
                <td>{titleCase(log.category)}</td>
                <td>{titleCase(log.severity)}</td>
                <td>{log.details}</td>
              </tr>
            ))}
          </SimpleTable>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
            <span className="muted-text text-sm">Total: {logsPage.totalElements || 0}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn small-btn" disabled={!logsPage.number} onClick={() => loadLogs((logsPage.number || 0) - 1)}>Previous</button>
              <button className="btn small-btn" disabled={(logsPage.number || 0) >= Math.max((logsPage.totalPages || 1) - 1, 0)} onClick={() => loadLogs((logsPage.number || 0) + 1)}>Next</button>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

function MetricGrid({ items }) {
  return (
    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
      {items.map((item) => (
        <div key={item.label} className="panel" style={{ background: "#f8fafc", borderRadius: 14 }}>
          <div className="muted-text text-sm">{item.label}</div>
          <div style={{ fontSize: 30, fontWeight: 700, color: item.tone }}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}

function UserTable({ users, onView, onStatus, onApprove, onResetPassword, onDelete }) {
  return (
    <SimpleTable headers={["Name", "Role", "Status", "Approval", "Last Login", "Actions"]}>
      {users.map((user) => (
        <tr key={user.id}>
          <td>{user.name}<div className="muted-text text-sm">{user.email}</div></td>
          <td>{titleCase(user.role)}</td>
          <td>{titleCase(user.status)}</td>
          <td>{titleCase(user.approvalState)}</td>
          <td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "-"}</td>
          <td style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn small-btn" onClick={() => onView(user.id)}>View</button>
            <button className="btn small-btn" onClick={() => onResetPassword(user.id)}>Reset</button>
            {user.status === "ACTIVE"
              ? <button className="btn small-btn danger-btn" onClick={() => onStatus(user, "DISABLED")}>Disable</button>
              : <button className="btn small-btn" onClick={() => onStatus(user, "ACTIVE")}>Activate</button>}
            {(user.role === "DOCTOR" || user.role === "PHARMACIST") && user.approvalState === "PENDING" && (
              <>
                <button className="btn small-btn" onClick={() => onApprove(user, true)}>Approve</button>
                <button className="btn small-btn danger-btn" onClick={() => onApprove(user, false)}>Reject</button>
              </>
            )}
            <button className="btn small-btn danger-btn" onClick={() => onDelete(user)}>Delete</button>
          </td>
        </tr>
      ))}
    </SimpleTable>
  );
}

function BreakdownCard({ title, data }) {
  return (
    <section className="card">
      <div className="section-header"><h2>{title}</h2></div>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="scheduler-row">
          <span>{titleCase(key)}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </section>
  );
}

function SimpleTable({ headers, children }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="table" style={{ width: "100%" }}>
        <thead>
          <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Bar({ value, label, color }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div className="muted-text text-sm">{label}: {value}</div>
      <div style={{ height: 8, background: "#e2e8f0", borderRadius: 999 }}>
        <div style={{ width: `${Math.min((value || 0) * 20, 100)}%`, height: "100%", borderRadius: 999, background: color }} />
      </div>
    </div>
  );
}

export default AdminDashboard;
