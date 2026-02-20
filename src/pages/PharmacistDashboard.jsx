import { orders, prescriptions, users, medicineInventory } from "../mockData";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

function PharmacistDashboard() {
  const pharmacistId = 4; // demo logged‑in pharmacist

  const navigate = useNavigate();
  const { logout } = useAuth();

  // Prescription queue: all issued prescriptions
  const queue = prescriptions.map((p) => {
    const patient = users.find((u) => u.user_id === p.patient_id);
    const doctor = users.find((u) => u.user_id === p.doctor_id);
    return {
      id: p.prescription_id,
      patient: patient ? patient.name : p.patient_id,
      doctor: doctor ? doctor.name : p.doctor_id,
      medicine: p.medicines,
      date: p.date,
      status: p.status
    };
  });

  const pendingPrescriptions = orders.filter((o) => o.status === "pending");
  const processedToday = orders.filter(
    (o) => o.status === "dispensed" && o.delivery_date === "2026-02-20"
  );

  const totalOrders = orders.length;

  const lowStockItems = medicineInventory.filter((m) => m.stock < 20);

  const handleDispense = (id) => {
    window.alert("Mock: dispensing prescription #" + id);
  };

  const handleQuickAction = (label) => {
    window.alert("Mock pharmacist action: " + label);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="card">
      <div className="dashboard-header">
        <div>
          <div className="dashboard-title">Pharmacist Dashboard</div>
          <p style={{ color: "#666", fontSize: 14 }}>
            Manage the prescription queue, monitor stock levels and keep orders
            flowing smoothly.
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

      {/* Summary cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Pending Prescriptions</div>
          <div className="kpi-value">{pendingPrescriptions.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Processed Today</div>
          <div className="kpi-value">{processedToday.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Orders</div>
          <div className="kpi-value">{totalOrders}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Low Stock Alerts</div>
          <div className="kpi-value">{lowStockItems.length}</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="quick-actions">
        <button className="btn" onClick={() => handleQuickAction("Update Inventory")}>
          Update Inventory
        </button>
        <button className="btn" onClick={() => handleQuickAction("View Orders")}>
          View Orders
        </button>
        <button className="btn" onClick={() => handleQuickAction("Drug Information")}>
          Drug Information
        </button>
      </div>

      <div className="dashboard-layout">
        <div>
          <div className="section-card">
            <div className="section-title">Prescription Queue</div>
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Medicine</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {queue.map((p) => (
                  <tr key={p.id}>
                    <td>{p.patient}</td>
                    <td>{p.doctor}</td>
                    <td>{p.medicine}</td>
                    <td>{p.date}</td>
                    <td>
                      <span
                        className={
                          "pill " +
                          (p.status === "issued" ? "pill-warning" : "pill-success")
                        }
                        style={{ textTransform: "capitalize" }}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn"
                        style={{ padding: "6px 10px", fontSize: 12 }}
                        onClick={() => handleDispense(p.id)}
                      >
                        Dispense
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
            <div className="section-title">Medicine Inventory</div>
            <ul style={{ listStyle: "none" }}>
              {medicineInventory.map((m) => (
                <li
                  key={m.id}
                  style={{
                    padding: "6px 0",
                    borderBottom: "1px solid #eee",
                    fontSize: 13
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{m.name}</div>
                  <div style={{ fontSize: 12 }}>
                    Stock: {m.stock}{" "}
                    {m.stock < 20 && (
                      <span className="pill pill-warning">Low</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="section-card">
            <div className="section-title">Notes</div>
            <p style={{ fontSize: 13, color: "#555" }}>
              Ensure prescriptions are complete and legible before dispensing.
              Always double‑check allergies and interactions when in doubt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PharmacistDashboard;
