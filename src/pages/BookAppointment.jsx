import { useState } from "react";

function BookAppointment() {
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");
  const [mode, setMode] = useState("Video");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Appointment booked successfully!");
  };

  return (
    <div className="card" style={{ maxWidth: "520px" }}>
      <h2>Book Appointment</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Fill the details to schedule your next virtual consultation.
      </p>

      <form onSubmit={handleSubmit}>
        <label>Doctor Name</label>
        <input
          className="input"
          placeholder="Enter doctor name"
          value={doctor}
          onChange={(e) => setDoctor(e.target.value)}
          required
        />

        <label>Appointment Date</label>
        <input
          className="input"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
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
