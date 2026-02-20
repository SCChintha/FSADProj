import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  appointments,
  prescriptions,
  medicalRecords,
  users,
  patientNotifications,
  patientHealthProfile
} from "../mockData";
import { useAuth } from "../AuthContext";

function PatientDashboard() {
  // Demo: logged‑in patient is user_id 3
  const patientId = 3;
  const navigate = useNavigate();
  const { logout } = useAuth();
  const patient = users.find((u) => u.user_id === patientId);

  const patientAppointments = appointments.filter((a) => a.patient_id === patientId);

  const upcomingAppointments = patientAppointments.filter(
    (a) => a.status === "scheduled"
  );

  const patientPrescriptions = prescriptions.filter(
    (p) => p.patient_id === patientId
  );

  const patientRecords = medicalRecords.filter((r) => r.patient_id === patientId);

  const sortedByDateDesc = [...patientPrescriptions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  const lastConsultation = sortedByDateDesc[0]?.date || "Not available";

  const nextAppointment = [...upcomingAppointments].sort(
    (a, b) => new Date(a.date + "T" + a.time) - new Date(b.date + "T" + b.time)
  )[0];

  const recentPrescriptions = sortedByDateDesc.slice(0, 3);

  // Upload state (mock)
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Join button state helper
  const getJoinState = (appointment) => {
    const now = new Date();
    const start = new Date(`${appointment.date}T${appointment.time}:00`);
    const thirtyMinutes = 30 * 60 * 1000;
    const oneHour = 60 * 60 * 1000;

    if (now.getTime() < start.getTime() - thirtyMinutes) {
      return { label: "Join", state: "future", disabled: true };
    }
    if (now.getTime() <= start.getTime() + oneHour) {
      return { label: "Join", state: "active", disabled: false };
    }
    return { label: "Completed", state: "completed", disabled: true };
  };

  const handleUploadMock = (fileName) => {
    setUploadFileName(fileName);
    setIsUploading(true);
    setUploadProgress(10);

    // Simple fake progress
    setTimeout(() => setUploadProgress(45), 400);
    setTimeout(() => setUploadProgress(80), 900);
    setTimeout(() => {
      setUploadProgress(100);
      setIsUploading(false);
    }, 1500);
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadMock(e.dataTransfer.files[0].name);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadMock(e.target.files[0].name);
    }
  };

  useEffect(() => {
    const prevent = (e) => {
      e.preventDefault();
    };
    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", prevent);
    return () => {
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", prevent);
    };
  }, []);

  return (
    <div className="card">
      <div className="dashboard-header">
        <div>
          <div className="dashboard-title">Patient Dashboard</div>
          <p style={{ color: "#666", fontSize: 14 }}>
            Welcome back{patient ? `, ${patient.name}` : ""}. Manage appointments,
            prescriptions and medical records in one place.
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ marginBottom: 8 }}>
            <button
              className="btn"
              style={{ padding: "6px 10px", fontSize: 12 }}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
          <div style={{ fontSize: 12, color: "#999" }}>Next Appointment</div>
          {nextAppointment ? (
            <div style={{ fontWeight: "bold", fontSize: 14 }}>
              {nextAppointment.date} at {nextAppointment.time}
            </div>
          ) : (
            <div style={{ fontWeight: "bold", fontSize: 14 }}>No upcoming visits</div>
          )}
        </div>
      </div>

      {/* KPI / Summary cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Upcoming Appointments</div>
          <div className="kpi-value">{upcomingAppointments.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Prescriptions</div>
          <div className="kpi-value">{patientPrescriptions.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Medical Records</div>
          <div className="kpi-value">{patientRecords.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Last Consultation Date</div>
          <div className="kpi-value" style={{ fontSize: 16 }}>
            {lastConsultation}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="quick-actions">
        <Link to="/book">
          <button className="btn">Book Appointment</button>
        </Link>
        <button
          className="btn"
          onClick={() => window.alert("Mock: joining consultation meeting link")}
        >
          Join Consultation
        </button>
        <button
          className="btn"
          onClick={() => window.alert("Mock: upload medical record flow")}
        >
          Upload Medical Record
        </button>
        <Link to="/prescriptions">
          <button className="btn">View Prescriptions</button>
        </Link>
      </div>

      <div className="dashboard-layout">
        <div>
          <div className="section-card" style={{ marginBottom: 16 }}>
            <div className="section-title">Health Summary</div>
            <div style={{ fontSize: 13 }}>
              <div style={{ marginBottom: 4 }}>
                <strong>Blood group:</strong> {patientHealthProfile.bloodGroup}
              </div>
              <div style={{ marginBottom: 4 }}>
                <strong>Age:</strong> {patientHealthProfile.age} years
              </div>
              <div style={{ marginBottom: 4 }}>
                <strong>Allergies:</strong>{" "}
                {patientHealthProfile.allergies.join(", ")}
              </div>
              <div>
                <strong>Chronic conditions:</strong>{" "}
                {patientHealthProfile.chronicConditions.join(", ")}
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-title">Upcoming Appointments</div>
            {upcomingAppointments.length === 0 ? (
              <p style={{ fontSize: 13, color: "#777" }}>No upcoming appointments.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingAppointments.map((a) => {
                    const doctor = users.find((u) => u.user_id === a.doctor_id);
                    return (
                      <tr key={a.appointment_id}>
                        <td>{doctor ? doctor.name : a.doctor_id}</td>
                        <td>{a.date}</td>
                        <td>{a.time}</td>
                        <td>
                          <span className="pill pill-info" style={{ textTransform: "capitalize" }}>
                            {a.status}
                          </span>
                        </td>
                        <td>
                          {(() => {
                            const join = getJoinState(a);
                            return (
                              <button
                                className="btn"
                                style={{
                                  padding: "6px 10px",
                                  fontSize: 12,
                                  opacity: join.disabled ? 0.6 : 1
                                }}
                                disabled={join.disabled}
                                onClick={() =>
                                  !join.disabled &&
                                  window.alert(
                                    "Mock: open meeting link " + a.meeting_link
                                  )
                                }
                              >
                                {join.label}
                              </button>
                            );
                          })()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="section-card">
            <div className="section-title">Appointment Timeline</div>
            <div className="timeline">
              {patientAppointments
                .slice()
                .sort(
                  (a, b) =>
                    new Date(a.date + "T" + a.time) -
                    new Date(b.date + "T" + b.time)
                )
                .map((a) => (
                  <div key={a.appointment_id} className="timeline-item">
                    <div style={{ fontSize: 13 }}>
                      {a.date} at {a.time}
                    </div>
                    <div style={{ fontSize: 12, color: "#555" }}>{a.reason}</div>
                  </div>
                ))}
              <div
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  color: "#999",
                  fontStyle: "italic"
                }}
              >
                Last consultation: {lastConsultation}
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-title">Recent Prescriptions</div>
            {recentPrescriptions.length === 0 ? (
              <p style={{ fontSize: 13, color: "#777" }}>No prescriptions yet.</p>
            ) : (
              <ul style={{ listStyle: "none" }}>
                {recentPrescriptions.map((p) => {
                  const doctor = users.find((u) => u.user_id === p.doctor_id);
                  return (
                    <li
                      key={p.prescription_id}
                      style={{
                        padding: "8px 0",
                        borderBottom: "1px solid #eee",
                        fontSize: 13
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{doctor ? doctor.name : p.doctor_id}</div>
                      <div style={{ color: "#555" }}>{p.medicines}</div>
                      <div style={{ color: "#999", fontSize: 12 }}>{p.date}</div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div>
          <div className="section-card">
            <div className="section-title">Notifications</div>
            {patientNotifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: "#f5f7fb",
                  marginBottom: 8,
                  fontSize: 13
                }}
              >
                <div style={{ marginBottom: 2 }}>{n.message}</div>
                <div style={{ fontSize: 11, color: "#999" }}>{n.time}</div>
              </div>
            ))}
          </div>

          <div className="section-card">
            <div className="section-title">Upload Medical Record</div>
            <label
              className="dropzone"
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <div style={{ fontSize: 13, marginBottom: 6 }}>
                Drag & drop a file here, or click to browse.
              </div>
              <input
                type="file"
                style={{ display: "none" }}
                onChange={onSelectFile}
              />
            </label>
            {uploadFileName && (
              <div style={{ marginTop: 10, fontSize: 13 }}>
                <strong>Selected:</strong> {uploadFileName}
                <div className="stock-bar" style={{ marginTop: 6 }}>
                  <div
                    className="stock-bar-inner"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div style={{ fontSize: 11, color: "#777", marginTop: 4 }}>
                  {isUploading
                    ? `Uploading... ${uploadProgress}% (mock)`
                    : "Upload complete (mock, not stored)"}
                </div>
              </div>
            )}
          </div>

          <div className="section-card">
            <div className="section-title">Health Tip</div>
            <p style={{ fontSize: 13, color: "#555" }}>
              Stay hydrated, keep your medical history updated, and join your
              consultation a few minutes early so doctors can review your
              records calmly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;
