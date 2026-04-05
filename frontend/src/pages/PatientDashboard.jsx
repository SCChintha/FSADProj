import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { apiRequest } from "../apiClient";
import { loadPatientData, titleCase } from "../liveData";
import IncomingCallModal from "../components/consultation/IncomingCallModal";
import PatientProfile from "./profile/PatientProfile";

const tabs = ["Overview", "Profile", "Book", "Appointments", "Records", "Prescriptions"];

function PatientDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState("Overview");
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [records, setRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCall, setActiveCall] = useState(null);
  const [search, setSearch] = useState("");
  const [callCompleted, setCallCompleted] = useState(Boolean(location.state?.callCompleted));
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    dob: "",
    bloodGroup: "",
    gender: "",
    address: "",
    phone: "",
  });

  const fetchData = async () => {
    if (!user?.user_id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await loadPatientData(token, user.user_id);
      setAppointments(data.appointments);
      setPrescriptions(data.prescriptions);
      setRecords(data.records);
      setDoctors(data.doctors);
      setError("");
    } catch (err) {
      console.error("Failed to load patient data", err);
      setError(err.message || "Failed to load patient data.");
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

  useEffect(() => {
    if (location.state?.callCompleted) {
      setCallCompleted(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filteredDoctors = useMemo(
    () =>
      doctors.filter((doctor) =>
        [doctor.name, doctor.specialization || ""].some((value) => value.toLowerCase().includes(search.toLowerCase()))
      ),
    [doctors, search]
  );

  const deleteAppointment = async (appointmentId) => {
    try {
      await apiRequest(`/api/appointments/${appointmentId}`, {
        method: "DELETE",
        token,
      });
      toast.success("Appointment cancelled successfully.");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to cancel appointment.");
    }
  };

  return (
    <div className="dashboard-page">
      <IncomingCallModal />
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Patient Dashboard</p>
          <h1 className="hero-title">Only backend data is shown here. No demo records are rendered.</h1>
          <p className="hero-copy">
            Appointments, doctors, prescriptions, and medical records are loaded from the API. Unimplemented sections stay empty until the backend supports them.
          </p>
        </div>
      </section>

      {callCompleted && !activeCall && (
        <section className="panel active-call-banner">
          <strong>Call completed</strong>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn secondary-btn" onClick={() => setCallCompleted(false)}>Dismiss</button>
            <button className="btn" onClick={() => navigate("/book")}>Book Another Appointment</button>
          </div>
        </section>
      )}

      {activeCall && (
        <section className="panel active-call-banner">
          <strong>You have an active consultation with {activeCall.callerName}</strong>
          <button className="btn" onClick={() => navigate(`/consultation/${activeCall.appointmentId}?role=patient&incoming=true`)}>
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
        <div className="panel"><div className="loading-wrap">Loading patient data...</div></div>
      ) : (
        <>
          {activeTab === "Overview" && (
            <>
              <div className="stats-grid">
                <article className="metric-card"><span>Appointments</span><strong>{appointments.length}</strong></article>
                <article className="metric-card"><span>Medical records</span><strong>{records.length}</strong></article>
                <article className="metric-card"><span>Prescriptions</span><strong>{prescriptions.length}</strong></article>
                <article className="metric-card"><span>Doctors</span><strong>{doctors.length}</strong></article>
              </div>

              <div className="dashboard-grid">
                <section className="panel">
                  <div className="section-header"><h2>Upcoming appointments</h2></div>
                  <div className="stack-list">
                    {appointments.length === 0 && <div className="empty-state">No appointments found.</div>}
                    {appointments.map((item) => (
                      <div key={item.id} className="feed-item">
                        <strong>{item.doctorName}</strong>
                        <span>{item.date} at {item.time}</span>
                        <small>{item.reason}</small>
                        <button className="btn small-btn" onClick={() => navigate(`/consultation/${item.id}?role=patient&incoming=true`)}>
                          Join Call
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="panel">
                  <div className="section-header"><h2>Recent medical records</h2></div>
                  <div className="timeline-list">
                    {records.length === 0 && <div className="empty-state">No medical records found.</div>}
                    {records.map((record) => (
                      <div className="timeline-card" key={record.id}>
                        <strong>{record.date}</strong>
                        <span>{record.description}</span>
                        <small>Uploaded by {record.uploadedBy}</small>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}

          {activeTab === "Profile" && (
            <div style={{ marginTop: '-48px', marginLeft: '-24px', marginRight: '-24px' }}>
              <PatientProfile />
            </div>
          )}

          {activeTab === "Book" && (
            <div className="dashboard-grid two-up">
              <section className="panel">
                <div className="section-header wrap">
                  <h2>Find a doctor</h2>
                  <input className="input compact-input" placeholder="Search doctor" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="card-grid">
                  {filteredDoctors.length === 0 && <div className="empty-state">No doctors returned by the backend.</div>}
                  {filteredDoctors.map((doctor) => (
                    <article className="doctor-card" key={doctor.id}>
                      <strong>{doctor.name}</strong>
                      <span>{doctor.specialization || "Specialization not available"}</span>
                      <small>{doctor.email}</small>
                    </article>
                  ))}
                </div>
              </section>
              <section className="panel">
                <div className="section-header"><h2>Booking</h2></div>
                <div className="stack-list">
                  <div className="feed-item"><strong>Doctor list</strong><span>Loaded from `/api/users/doctors`.</span></div>
                  <div className="feed-item"><strong>Appointment creation</strong><span>Handled by the real booking form and stored through `/api/appointments`.</span></div>
                </div>
                <Link to="/book"><button className="btn">Open booking form</button></Link>
              </section>
            </div>
          )}

          {activeTab === "Appointments" && (
            <section className="panel">
              <div className="section-header wrap">
                <h2>My appointments</h2>
                <button className="btn secondary-btn" onClick={fetchData}>Refresh</button>
              </div>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Mode</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((item) => (
                      <tr key={item.id}>
                        <td>{item.doctorName}</td>
                        <td>{item.date} {item.time}</td>
                        <td><span className="status-badge info">{titleCase(item.status)}</span></td>
                        <td>{titleCase(item.mode)}</td>
                        <td className="actions-cell">
                          <button className="btn small-btn" onClick={() => navigate(`/consultation/${item.id}?role=patient&incoming=true`)}>Join Call</button>
                          <button className="btn small-btn danger-btn" onClick={() => deleteAppointment(item.id)}>Cancel</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === "Records" && (
            <section className="panel">
              <div className="section-header"><h2>Medical records</h2></div>
              <div className="timeline-list">
                {records.length === 0 && <div className="empty-state">No medical records found.</div>}
                {records.map((record) => (
                  <div className="timeline-card expanded" key={record.id}>
                    <strong>{record.date}</strong>
                    <span>{record.description}</span>
                    <small>Uploaded by {record.uploadedBy}</small>
                    <p>{record.fileUrl}</p>
                  </div>
                ))}
              </div>
              <Link to="/records"><button className="btn">Manage records</button></Link>
            </section>
          )}

          {activeTab === "Prescriptions" && (
            <section className="panel">
              <div className="section-header"><h2>My prescriptions</h2></div>
              <div className="card-grid">
                {prescriptions.length === 0 && <div className="empty-state">No prescriptions found.</div>}
                {prescriptions.map((item) => (
                  <article key={item.id} className="doctor-card">
                    <strong>{item.id}</strong>
                    <span>Issued by {item.doctorName}</span>
                    <small>{item.issuedDate}</small>
                    <div className="stack-list compact-stack">
                      {item.medications.map((medication) => (
                        <div key={`${item.id}-${medication.drug}`} className="feed-item">
                          <strong>{medication.drug}</strong>
                          <span>{medication.dosage} · {medication.duration}</span>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

        </>
      )}
    </div>
  );
}

export default PatientDashboard;
