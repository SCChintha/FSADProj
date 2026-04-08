import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { apiRequest } from "../apiClient";
import { loadDoctorData, titleCase } from "../liveData";
import DoctorProfile from "./profile/DoctorProfile";

const tabs = ["Overview", "Profile", "Appointments", "Prescriptions", "Patients"];
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function DoctorDashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState("Overview");
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCall, setActiveCall] = useState(null);
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    specialization: "",
    qualification: "",
    licenseNumber: "",
    experience: "",
    fee: "",
    bio: "",
  });
  const [scheduler, setScheduler] = useState({
    Mon: "",
    Tue: "",
    Wed: "",
    Thu: "",
    Fri: "",
    Sat: "",
    Sun: "",
  });
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: "",
    appointmentId: "",
    medicine: "",
    dosage: "",
    duration: "",
    notes: "",
  });

  const fetchData = async () => {
    if (!user?.user_id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await loadDoctorData(token, user.user_id);
      setAppointments(data.appointments);
      setPrescriptions(data.prescriptions);
      setError("");
    } catch (err) {
      console.error("Failed to load doctor data", err);
      setError(err.message || "Failed to load doctor data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setProfile((current) => ({ ...current, name: user?.name || "", email: user?.email || "" }));
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [token, user]);

  useEffect(() => {
    if (!token) {
      return;
    }
    apiRequest("/api/calls/active", { token })
      .then((data) => setActiveCall(data.active ? data.callSession : null))
      .catch(() => setActiveCall(null));
  }, [token]);

  const today = new Date().toISOString().slice(0, 10);
  const todayAppointments = appointments.filter((item) => item.date === today);
  const patients = useMemo(() => {
    const byId = new Map();
    appointments.forEach((item) => {
      if (item.patientId) {
        byId.set(item.patientId, {
          id: item.patientId,
          name: item.patientName,
          email: item.patient?.email || "",
          appointmentsCount: appointments.filter((appointment) => appointment.patientId === item.patientId).length,
        });
      }
    });
    return [...byId.values()];
  }, [appointments]);

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      await apiRequest(`/api/appointments/${appointmentId}/status?status=${status}`, {
        method: "PATCH",
        token,
      });
      toast.success(`Appointment marked ${titleCase(status)}`);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update appointment.");
    }
  };

  const createPrescription = async (event) => {
    event.preventDefault();

    try {
      await apiRequest("/doctor/prescriptions", {
        method: "POST",
        token,
        body: {
          patientId: Number(prescriptionForm.patientId),
          appointmentId: prescriptionForm.appointmentId ? Number(prescriptionForm.appointmentId) : null,
          medicine: prescriptionForm.medicine,
          dosage: prescriptionForm.dosage,
          duration: prescriptionForm.duration,
          notes: prescriptionForm.notes,
        },
      });
      toast.success("Prescription saved successfully.");
      setPrescriptionForm({
        patientId: "",
        appointmentId: "",
        medicine: "",
        dosage: "",
        duration: "",
        notes: "",
      });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to save prescription.");
    }
  };

  return (
    <div className="dashboard-page">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Doctor Dashboard</p>
          <h1 className="hero-title">Everything shown here is loaded from the backend or left empty.</h1>
          <p className="hero-copy">
            Appointments and prescriptions are database-backed. Features without backend support are shown as empty states instead of mock records.
          </p>
        </div>
      </section>

      {activeCall && (
        <section className="panel active-call-banner">
          <strong>You have an active consultation with {activeCall.receiverName}</strong>
          <button className="btn" onClick={() => navigate(`/consultation/${activeCall.appointmentId}?role=doctor&incoming=false`)}>
            Rejoin Call
          </button>
        </section>
      )}

      <div className="tab-row">
        {tabs.map((tab) => (
          <button key={tab} className={`tab-chip${activeTab === tab ? " active" : ""}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {error && <div className="panel"><div className="error-state">{error}</div></div>}

      {loading ? (
        <div className="panel"><div className="loading-wrap">Loading doctor data...</div></div>
      ) : (
        <>
          {activeTab === "Overview" && (
            <>
              <div className="stats-grid">
                <article className="metric-card"><span>Total appointments</span><strong>{appointments.length}</strong></article>
                <article className="metric-card"><span>Today's appointments</span><strong>{todayAppointments.length}</strong></article>
                <article className="metric-card"><span>Patients</span><strong>{patients.length}</strong></article>
                <article className="metric-card"><span>Prescriptions</span><strong>{prescriptions.length}</strong></article>
              </div>

              <div className="dashboard-grid">
                <section className="panel">
                  <div className="section-header"><h2>Today's schedule</h2></div>
                  <div className="timeline-list">
                    {todayAppointments.length === 0 && <div className="empty-state">No appointments scheduled for today.</div>}
                    {todayAppointments.map((item) => (
                      <div key={item.id} className="timeline-card">
                        <strong>{item.time}</strong>
                        <span>{item.patientName}</span>
                        <small>{item.reason}</small>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="panel">
                  <div className="section-header"><h2>Upcoming queue</h2></div>
                  <div className="stack-list">
                    {appointments.length === 0 && <div className="empty-state">No appointments found.</div>}
                    {appointments.map((item) => (
                      <div key={item.id} className="feed-item">
                        <strong>{item.patientName}</strong>
                        <span>{item.date} at {item.time}</span>
                        <small>{titleCase(item.status)}</small>
                        <button
                          className="btn small-btn"
                          onClick={() => navigate(`/consultation/${item.id}?role=doctor&incoming=false`)}
                        >
                          Start Call
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}

          {activeTab === "Profile" && (
            <div style={{ marginTop: '-48px', marginLeft: '-24px', marginRight: '-24px' }}>
              <DoctorProfile />
            </div>
          )}

          {activeTab === "Appointments" && (
            <section className="panel">
              <div className="section-header wrap">
                <h2>Appointments</h2>
                <button className="btn secondary-btn" onClick={fetchData}>Refresh</button>
              </div>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Reason</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((item) => (
                      <tr key={item.id}>
                        <td>{item.patientName}</td>
                        <td>{item.date} {item.time}</td>
                        <td><span className="status-badge info">{titleCase(item.status)}</span></td>
                        <td>{item.reason}</td>
                        <td className="actions-cell">
                          <button className="btn small-btn" onClick={() => navigate(`/consultation/${item.id}?role=doctor&incoming=false`)}>Start Call</button>
                          <button className="btn small-btn" onClick={() => updateAppointmentStatus(item.id, "COMPLETED")}>Complete</button>
                          <button className="btn small-btn danger-btn" onClick={() => updateAppointmentStatus(item.id, "CANCELLED")}>Cancel</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === "Prescriptions" && (
            <div className="dashboard-grid two-up">
              <section className="panel">
                <div className="section-header"><h2>Create prescription</h2></div>
                <form onSubmit={createPrescription}>
                  <select className="input" value={prescriptionForm.patientId} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, patientId: e.target.value })} required>
                    <option value="">Select patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>{patient.name}</option>
                    ))}
                  </select>
                  <select className="input" value={prescriptionForm.appointmentId} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, appointmentId: e.target.value })}>
                    <option value="">Link appointment (optional)</option>
                    {appointments.filter((item) => String(item.patientId) === prescriptionForm.patientId).map((item) => (
                      <option key={item.id} value={item.id}>{item.date} {item.time}</option>
                    ))}
                  </select>
                  <input className="input" placeholder="Medicine" value={prescriptionForm.medicine} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medicine: e.target.value })} required />
                  <input className="input" placeholder="Dosage" value={prescriptionForm.dosage} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })} required />
                  <input className="input" placeholder="Duration" value={prescriptionForm.duration} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, duration: e.target.value })} required />
                  <textarea className="input" rows={4} placeholder="Notes / instructions" value={prescriptionForm.notes} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })} />
                  <button className="btn" type="submit">Save Prescription</button>
                </form>
              </section>

              <section className="panel">
                <div className="section-header"><h2>Prescription history</h2></div>
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Patient</th>
                        <th>Medicine</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptions.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{item.patientName}</td>
                          <td>{item.medicineName}</td>
                          <td>{item.issuedDate}</td>
                          <td><span className="status-badge info">{titleCase(item.status)}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {activeTab === "Patients" && (
            <section className="panel">
              <div className="section-header"><h2>Patients</h2></div>
              <div className="stack-list">
                {patients.length === 0 && <div className="empty-state">No patients found from appointment history.</div>}
                {patients.map((patient) => (
                  <div key={patient.id} className="patient-card">
                    <div>
                      <strong>{patient.name}</strong>
                      <span>{patient.email || "No email returned"}</span>
                      <small>Appointments: {patient.appointmentsCount}</small>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default DoctorDashboard;
