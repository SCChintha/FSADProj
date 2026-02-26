import { useState } from "react";
import { useAuth } from "../AuthContext";
import { getAppointments, saveAppointments, getUsers } from "../mockData";
import { useNavigate } from "react-router-dom";

function BookAppointment() {
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [mode, setMode] = useState("Video");

  const { user } = useAuth();
  const navigate = useNavigate();

  const doctors = getUsers().filter((u) => u.role === "doctor" && u.status === "active");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!doctorId) {
      alert("Please select a doctor.");
      return;
    }

    const existing = getAppointments();
    const newAppointment = {
      appointment_id: Date.now(),
      patient_id: user?.user_id || 3, // fallback to demo patient
      doctor_id: parseInt(doctorId),
      date: date,
      time: time || "10:00",
      status: "scheduled",
      reason: `Consultation (${mode})`,
      meeting_link: "https://meet.example.com/" + Math.random().toString(36).substring(7)
    };

    existing.push(newAppointment);
    saveAppointments(existing);

    alert("Appointment booked successfully!");
    navigate("/patient");
  };

  return (
    <div className="card" style={{ maxWidth: "520px" }}>
      <h2>Book Appointment</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Fill the details to schedule your next virtual consultation.
      </p>

      <form onSubmit={handleSubmit}>
        <label>Doctor Name</label>
        <select
          className="input"
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
          required
        >
          <option value="">Select a Doctor</option>
          {doctors.map((d) => (
            <option key={d.user_id} value={d.user_id}>
              {d.name}
            </option>
          ))}
        </select>

        <label>Appointment Date</label>
        <input
          className="input"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <label>Appointment Time</label>
        <input
          className="input"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />

        <label>Mode</label>
        <select
          className="input"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="Video">Video call</option>
          <option value="Audio">Audio call</option>
          <option value="Chat">Chat only</option>
        </select>

        <button className="btn" type="submit">
          Book Appointment
        </button>
      </form>

      <div
        style={{
          marginTop: 16,
          fontSize: 12,
          color: "#777",
          borderTop: "1px solid #eee",
          paddingTop: 10
        }}
      >
        You will receive a confirmation notification with the meeting link once
        the doctor accepts your request.
      </div>
    </div>
  );
}

export default BookAppointment;
