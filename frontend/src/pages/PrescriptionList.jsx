import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { apiRequest } from "../apiClient";

function PrescriptionList() {
  const { user, token } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPrescriptions = async () => {
    if (!user?.user_id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      console.log("[prescriptions] loading");
      const data = await apiRequest(`/prescriptions/patient/${user.user_id}`, { token });
      console.log("[prescriptions] response", data);
      setPrescriptions(data || []);
      setError("");
    } catch (err) {
      console.error("Failed to load prescriptions", err);
      setError("Failed to load prescriptions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [user, token]);

  return (
    <div className="card">
      <h2>My Prescriptions</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Download and view your prescriptions.
      </p>

      <div className="toolbar-actions" style={{ marginBottom: 16 }}>
        <button className="btn" onClick={fetchPrescriptions}>Refresh</button>
      </div>

      {error && <div className="error-state">{error}</div>}

      {loading ? (
        <div className="loading-wrap"><div className="spinner" />Loading prescriptions...</div>
      ) : prescriptions.length === 0 ? (
        <div className="empty-state">No data available.</div>
      ) : (
        <table className="table">
        <thead>
          <tr>
            <th>Doctor</th>
            <th>Medicine</th>
            <th>Date</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          {prescriptions.map((p) => {
            return (
              <tr key={p.id}>
                <td>{p.doctorName || p.doctor?.name || p.doctorId || "-"}</td>
                <td>
                  {p.medicineName || (p.items && p.items.length > 0
                    ? p.items[0].medicineName
                    : "-")}
                </td>
                <td>{p.date}</td>
                <td>
                  <button className="btn">Download</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      )}
    </div>
  );
}

export default PrescriptionList;
