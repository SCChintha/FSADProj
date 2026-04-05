import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../AuthContext";
import { apiRequest } from "../apiClient";

function BookAppointment() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [mode, setMode] = useState("ONLINE");
  const [loading, setLoading] = useState(false);
  const [slotLoading, setSlotLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const data = await apiRequest("/api/users/doctors", { token });
        setDoctors((data || []).filter((item) => item.status === "ACTIVE"));
      } catch (error) {
        console.error("Failed to load doctors", error);
        toast.error(error.message || "Failed to load doctors");
      }
    };

    loadDoctors();
  }, [token]);

  useEffect(() => {
    const loadAvailability = async () => {
      if (!doctorId || !date) {
        setAvailableSlots([]);
        setTime("");
        return;
      }
      try {
        setSlotLoading(true);
        const data = await apiRequest(`/api/appointments/doctors/${doctorId}/availability?date=${date}`, { token });
        setAvailableSlots(data.availableSlots || []);
        setTime("");
      } catch (error) {
        console.error("Failed to load doctor availability", error);
        toast.error(error.message || "Failed to load doctor availability");
        setAvailableSlots([]);
      } finally {
        setSlotLoading(false);
      }
    };

    loadAvailability();
  }, [doctorId, date, token]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user?.user_id) {
      toast.error("You must be logged in as a patient to book an appointment.");
      return;
    }

    try {
      setLoading(true);
      await apiRequest("/patient/appointments", {
        method: "POST",
        token,
        body: {
          doctorId: Number(doctorId),
          date,
          time: `${time}:00`,
          mode,
          reason,
        },
      });

      toast.success("Appointment booked successfully.");
      navigate("/patient");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <h2>Book Appointment</h2>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Choose a doctor, date, and available slot to schedule your visit.
      </p>

      <form onSubmit={handleSubmit}>
        <label>Doctor</label>
        <select className="input" value={doctorId} onChange={(event) => setDoctorId(event.target.value)} required>
          <option value="">Select a doctor</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name} ({doctor.email})
            </option>
          ))}
        </select>

        <label>Date</label>
        <input className="input" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />

        <label>Available Time Slot</label>
        <select className="input" value={time} onChange={(event) => setTime(event.target.value)} required disabled={!doctorId || !date || slotLoading}>
          <option value="">{slotLoading ? "Loading slots..." : "Select a slot"}</option>
          {availableSlots.map((slot) => (
            <option key={slot} value={slot}>{slot}</option>
          ))}
        </select>
        {!slotLoading && doctorId && date && availableSlots.length === 0 && (
          <p className="muted-text text-sm">No available slots for the selected doctor on this date.</p>
        )}

        <label>Consultation Mode</label>
        <select className="input" value={mode} onChange={(event) => setMode(event.target.value)}>
          <option value="ONLINE">Online</option>
          <option value="IN_PERSON">In Person</option>
        </select>

        <label>Reason</label>
        <textarea
          className="input"
          rows={4}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Describe your concern briefly"
          required
        />

        <button className="btn" type="submit" disabled={loading || !time}>
          {loading ? "Booking..." : "Book Appointment"}
        </button>
      </form>
    </div>
  );
}

export default BookAppointment;
