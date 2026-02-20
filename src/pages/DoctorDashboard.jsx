import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { appointments, prescriptions, users } from "../mockData";
import { useAuth } from "../AuthContext";

function DoctorDashboard() {
  // Assume logged-in doctor is user_id 2 for demo purposes
  const doctorId = 2;
  const doctor = users.find((u) => u.user_id === doctorId);

  const navigate = useNavigate();
  const { logout } = useAuth();

  const todayStr = "2026-02-20"; // demo "today" aligned with mock data

  const todaysAppointments = appointments.filter(
    (a) => a.doctor_id === doctorId && a.date === todayStr
  );

  const uniquePatients = Array.from(
    new Set(appointments.filter((a) => a.doctor_id === doctorId).map((a) => a.patient_id))
  );

  const pendingConsultations = todaysAppointments.filter((a) => a.status === "scheduled");

  const todaysPrescriptions = prescriptions.filter(
    (p) => p.doctor_id === doctorId && p.date === todayStr
  );

  const [notes, setNotes] = useState("");

  const [activeAppointmentId, setActiveAppointmentId] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [selectedPatient, setSelectedPatient] = useState(null);

  const [prescriptionForm, setPrescriptionForm] = useState({
    medicine: "",
    dosage: "",
    duration: "",
    extraNotes: ""
  });

  const recentPatients = appointments
    .filter((a) => a.doctor_id === doctorId)
    .sort(
      (a, b) =>
        new Date(b.date + "T" + b.time) - new Date(a.date + "T" + a.time)
    )
    .slice(0, 5);

  const handleStartConsultation = (appointmentId) => {
    setActiveAppointmentId(appointmentId);
    setElapsedSeconds(0);
    window.alert("Mock: starting consultation for appointment #" + appointmentId);
  };

  const handleSaveNotes = () => {
    window.alert("Mock: notes saved: " + notes);
  };

  const handlePatientClick = (patientId) => {
    const patient = users.find((u) => u.user_id === patientId);
    if (!patient) return;

    const historyAppointments = appointments.filter(
      (a) => a.patient_id === patientId && a.doctor_id === doctorId
    );
    const lastVisit = historyAppointments
      .slice()
      .sort(
        (a, b) =>
          new Date(b.date + "T" + b.time) - new Date(a.date + "T" + a.time)
      )[0];

    const allergiesMock = ["Penicillin", "Peanuts"];

    setSelectedPatient({
      name: patient.name,
      age: 29,
      lastVisit: lastVisit ? `${lastVisit.date} ${lastVisit.time}` : "No visits yet",
      historyCount: historyAppointments.length,
      allergies: allergiesMock
    });
  };

  const handlePrescriptionSubmit = (e) => {
    e.preventDefault();
    window.alert(
      "Mock prescription created: " + JSON.stringify(prescriptionForm, null, 2)
    );
  };

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (!activeAppointmentId) return;
    const id = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [activeAppointmentId]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="card">
      <div className="dashboard-header">
        <div>
          <div className="dashboard-title">Doctor Dashboard</div>
          <p style={{ color: "#666", fontSize: 14 }}>
            Good day{doctor ? `, ${doctor.name}` : ""}. Review today's schedule,
            start consultations and capture quick notes.
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
        {activeAppointmentId && (
          <div
            className="kpi-card"
            style={{
              minWidth: 180,
              background: "#e8f5e9",
              alignSelf: "flex-start"
            }}
          >
            <div className="kpi-label">Consultation Timer</div>
            <div className="kpi-value">{formatTime(elapsedSeconds)}</div>
          </div>
        )}
      </div>

      {/* KPI cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Today's Appointments</div>
          <div className="kpi-value">{todaysAppointments.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Patients</div>
          <div className="kpi-value">{uniquePatients.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Pending Consultations</div>
          <div className="kpi-value">{pendingConsultations.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Prescriptions Today</div>
          <div className="kpi-value">{todaysPrescriptions.length}</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="quick-actions">
        <button
          className="btn"
          onClick={() => window.alert("Mock: open first pending consultation")}
        >
          Start Consultation
        </button>
        <button
          className="btn"
          onClick={() => window.alert("Mock: create prescription form")}
        >
          Create Prescription
        </button>
        <button
          className="btn"
          onClick={() => window.alert("Mock: open patient records view")}
        >
          View Patient Records
        </button>
      </div>

      <div className="dashboard-layout">
        <div>
          <div className="section-card">
            <div className="section-title">Today's Schedule</div>
            {todaysAppointments.length === 0 ? (
              <p style={{ fontSize: 13, color: "#777" }}>No appointments for today.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Time</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {todaysAppointments.map((a) => {
                    const patient = users.find((u) => u.user_id === a.patient_id);
                    return (
                      <tr key={a.appointment_id}>
                        <td>
                          <button
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              color: "#1976d2",
                              cursor: "pointer",
                              textDecoration: "underline"
                            }}
                            onClick={() => handlePatientClick(a.patient_id)}
                          >
                            {patient ? patient.name : a.patient_id}
                          </button>
                        </td>
                        <td>{a.time}</td>
                        <td>{a.reason}</td>
                        <td>
                          <span
                            className={
                              "pill " +
                              (a.status === "scheduled"
                                ? "pill-warning"
                                : "pill-success")
                            }
                            style={{ textTransform: "capitalize" }}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn"
                            style={{ padding: "6px 10px", fontSize: 12 }}
                            onClick={() => handleStartConsultation(a.appointment_id)}
                          >
                            Start
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="section-card">
            <div className="section-title">Recent Patients</div>
            {recentPatients.length === 0 ? (
              <p style={{ fontSize: 13, color: "#777" }}>No recent consultations.</p>
            ) : (
              <ul style={{ listStyle: "none" }}>
                {recentPatients.map((a) => {
                  const patient = users.find((u) => u.user_id === a.patient_id);
                  return (
                    <li
                      key={a.appointment_id}
                      style={{
                        padding: "6px 0",
                        borderBottom: "1px solid #eee",
                        fontSize: 13
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            color: "#1976d2",
                            cursor: "pointer",
                            textDecoration: "underline"
                          }}
                          onClick={() => handlePatientClick(a.patient_id)}
                        >
                          {patient ? patient.name : a.patient_id}
                        </button>
                      </div>
                      <div style={{ color: "#999", fontSize: 12 }}>
                        {a.date} at {a.time}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div>
          <div className="section-card">
            <div className="section-title">Consultation Notes</div>
            <textarea
              className="input"
              rows={4}
              placeholder="Quick notes for your next consultation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button className="btn" onClick={handleSaveNotes}>
              Save Notes (Mock)
            </button>
          </div>

          <div className="section-card">
            <div className="section-title">Prescription Builder</div>
            <form onSubmit={handlePrescriptionSubmit} style={{ fontSize: 13 }}>
              <input
                className="input"
                placeholder="Medicine name"
                value={prescriptionForm.medicine}
                onChange={(e) =>
                  setPrescriptionForm({
                    ...prescriptionForm,
                    medicine: e.target.value
                  })
                }
                required
              />
              <input
                className="input"
                placeholder="Dosage (e.g. 1 tablet twice a day)"
                value={prescriptionForm.dosage}
                onChange={(e) =>
                  setPrescriptionForm({
                    ...prescriptionForm,
                    dosage: e.target.value
                  })
                }
                required
              />
              <input
                className="input"
                placeholder="Duration (e.g. 5 days)"
                value={prescriptionForm.duration}
                onChange={(e) =>
                  setPrescriptionForm({
                    ...prescriptionForm,
                    duration: e.target.value
                  })
                }
                required
              />
              <textarea
                className="input"
                rows={3}
                placeholder="Notes for pharmacist / patient"
                value={prescriptionForm.extraNotes}
                onChange={(e) =>
                  setPrescriptionForm({
                    ...prescriptionForm,
                    extraNotes: e.target.value
                  })
                }
              />
              <button className="btn" type="submit">
                Create Prescription (Mock)
              </button>
            </form>
          </div>

          <div className="section-card">
            <div className="section-title">Tips</div>
            <p style={{ fontSize: 13, color: "#555" }}>
              Review the latest medical records and previous prescriptions before
              you start each consultation. This helps you make faster and safer
              clinical decisions.
            </p>
          </div>
        </div>
      </div>

      <div className="section-card" style={{ marginTop: 16 }}>
        <div className="section-title">Daily Workload</div>
        <div style={{ fontSize: 12, color: "#555", marginBottom: 6 }}>
          Appointments per day (mocked from schedule)
        </div>
        {Object.entries(
          appointments
            .filter((a) => a.doctor_id === doctorId)
            .reduce((acc, a) => {
              acc[a.date] = (acc[a.date] || 0) + 1;
              return acc;
            }, {})
        ).map(([date, count]) => (
          <div key={date} style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 12, marginBottom: 2 }}>{date}</div>
            <div className="stock-bar">
              <div
                className="stock-bar-inner"
                style={{ width: `${Math.min(count * 40, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {selectedPatient && (
        <div className="modal-backdrop" onClick={() => setSelectedPatient(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="section-title" style={{ marginBottom: 8 }}>
              Patient Quick View
            </div>
            <div style={{ fontSize: 13 }}>
              <div style={{ marginBottom: 4 }}>
                <strong>Name:</strong> {selectedPatient.name}
              </div>
              <div style={{ marginBottom: 4 }}>
                <strong>Age:</strong> {selectedPatient.age} years
              </div>
              <div style={{ marginBottom: 4 }}>
                <strong>Last visit:</strong> {selectedPatient.lastVisit}
              </div>
              <div style={{ marginBottom: 4 }}>
                <strong>Visits with you:</strong> {selectedPatient.historyCount}
              </div>
              <div>
                <strong>Allergies:</strong> {selectedPatient.allergies.join(", ")}
              </div>
            </div>
            <button
              className="btn"
              style={{ marginTop: 14 }}
              onClick={() => setSelectedPatient(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorDashboard;
